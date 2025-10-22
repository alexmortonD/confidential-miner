import { useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useAccount, useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { MINER_CONTRACT, TOKEN_CONTRACT } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import '../styles/MinerApp.css';

const ZERO_HANDLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

type Feedback = {
  tone: 'info' | 'success' | 'error';
  message: string;
};

type SnapshotTuple = readonly [string, string, boolean, bigint];

const normalizeHandle = (value?: string | `0x${string}`): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized === '0x' || normalized === '0x0') {
    return ZERO_HANDLE;
  }

  try {
    if (BigInt(normalized) === 0n) {
      return ZERO_HANDLE;
    }
  } catch {
    return normalized;
  }

  return normalized;
};

const formatTimestamp = (timestamp?: bigint): string => {
  if (!timestamp || timestamp === 0n) {
    return '—';
  }
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export function MinerApp() {
  const { address } = useAccount();
  const { instance, isLoading: isInstanceLoading, error: instanceError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [powerValue, setPowerValue] = useState<bigint | null>(null);
  const [pendingValue, setPendingValue] = useState<bigint | null>(null);
  const [balanceValue, setBalanceValue] = useState<bigint | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [txInFlight, setTxInFlight] = useState<null | 'claim' | 'start' | 'stop' | 'withdraw'>(null);

  const accountAddress = address as Address | undefined;

  const {
    data: minerIdRaw,
    refetch: refetchMinerId,
    isFetching: isFetchingMinerId,
  } = useReadContract({
    address: MINER_CONTRACT.address,
    abi: MINER_CONTRACT.abi,
    functionName: 'minerIdOf',
    args: accountAddress ? [accountAddress] : undefined,
    query: {
      enabled: Boolean(accountAddress),
    },
  });

  const minerId = useMemo(() => {
    if (typeof minerIdRaw === 'bigint') {
      return minerIdRaw;
    }
    return undefined;
  }, [minerIdRaw]);

  const hasMiner = Boolean(minerId && minerId > 0n);

  const {
    data: snapshotRaw,
    refetch: refetchSnapshot,
  } = useReadContract({
    address: MINER_CONTRACT.address,
    abi: MINER_CONTRACT.abi,
    functionName: 'getMinerSnapshot',
    args: hasMiner && minerId ? [minerId] : undefined,
    query: {
      enabled: Boolean(hasMiner && minerId),
    },
  });

  const snapshot = useMemo<SnapshotTuple | undefined>(() => {
    if (Array.isArray(snapshotRaw) && snapshotRaw.length === 4) {
      const casted = snapshotRaw as SnapshotTuple;
      return casted;
    }
    return undefined;
  }, [snapshotRaw]);

  const miningActive = snapshot ? snapshot[2] : false;
  const lastUpdate = snapshot ? snapshot[3] : undefined;

  const {
    data: balanceCipherRaw,
    refetch: refetchBalance,
  } = useReadContract({
    address: TOKEN_CONTRACT.address,
    abi: TOKEN_CONTRACT.abi,
    functionName: 'confidentialBalanceOf',
    args: accountAddress ? [accountAddress] : undefined,
    query: {
      enabled: Boolean(accountAddress),
    },
  });

  const powerHandle = normalizeHandle(snapshot?.[0]);
  const pendingHandle = normalizeHandle(snapshot?.[1]);
  const balanceHandle = normalizeHandle(balanceCipherRaw as string | undefined);

  const decryptHandles = useMemo(() => {
    const handlesMap = new Map<string, { handle: string; contractAddress: Address }>();

    if (powerHandle && powerHandle !== ZERO_HANDLE) {
      handlesMap.set(powerHandle, { handle: powerHandle, contractAddress: MINER_CONTRACT.address });
    }

    if (pendingHandle && pendingHandle !== ZERO_HANDLE) {
      handlesMap.set(pendingHandle, { handle: pendingHandle, contractAddress: MINER_CONTRACT.address });
    }

    if (balanceHandle && balanceHandle !== ZERO_HANDLE) {
      handlesMap.set(balanceHandle, { handle: balanceHandle, contractAddress: TOKEN_CONTRACT.address });
    }

    return Array.from(handlesMap.values());
  }, [powerHandle, pendingHandle, balanceHandle]);

  useEffect(() => {
    if (!accountAddress) {
      setPowerValue(null);
      setPendingValue(null);
      setBalanceValue(null);
      setDecrypting(false);
      setDecryptError(null);
      return;
    }

    setPowerValue(powerHandle === ZERO_HANDLE ? 0n : null);
    setPendingValue(pendingHandle === ZERO_HANDLE ? 0n : null);
    setBalanceValue(!balanceHandle || balanceHandle === ZERO_HANDLE ? 0n : null);

    setDecrypting(false);
    setDecryptError(null);
  }, [accountAddress, powerHandle, pendingHandle, balanceHandle]);

  const handleDecryptValues = async () => {
    if (!accountAddress) {
      setDecryptError('Connect your wallet to decrypt values');
      return;
    }

    if (!instance) {
      setDecryptError('Encryption service unavailable');
      return;
    }

    if (!decryptHandles.length) {
      setDecryptError('No encrypted values available to decrypt');
      return;
    }

    try {
      setDecrypting(true);
      setDecryptError(null);

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer unavailable');
      }

      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contractAddresses = Array.from(new Set(decryptHandles.map((item) => item.contractAddress)));

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        decryptHandles,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        accountAddress,
        startTimestamp,
        durationDays,
      );

      if (powerHandle) {
        const decrypted = powerHandle === ZERO_HANDLE ? 0n : BigInt(result[powerHandle] ?? 0);
        setPowerValue(decrypted);
      }

      if (pendingHandle) {
        const decrypted = pendingHandle === ZERO_HANDLE ? 0n : BigInt(result[pendingHandle] ?? 0);
        setPendingValue(decrypted);
      }

      if (balanceHandle) {
        const decrypted = balanceHandle === ZERO_HANDLE ? 0n : BigInt(result[balanceHandle] ?? 0);
        setBalanceValue(decrypted);
      }

      setDecrypting(false);
    } catch (error) {
      console.error('Failed to decrypt miner data:', error);
      setDecrypting(false);
      setDecryptError(error instanceof Error ? error.message : 'Unable to decrypt encrypted values');
    }
  };

  const canDecrypt = decryptHandles.length > 0 && !isInstanceLoading && Boolean(instance);

  const resetFeedback = () => setFeedback(null);

  const handleClaim = async () => {
    if (!accountAddress) {
      setFeedback({ tone: 'error', message: 'Connect your wallet to claim a miner.' });
      return;
    }

    try {
      setTxInFlight('claim');
      resetFeedback();
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer unavailable');
      }

      const minerContract = new Contract(MINER_CONTRACT.address, MINER_CONTRACT.abi, signer);
      const tx = await minerContract.claimMiner();
      await tx.wait();

      await refetchMinerId();
      await refetchSnapshot();
      await refetchBalance();

      setFeedback({ tone: 'success', message: 'Miner claimed successfully. You can start mining now.' });
    } catch (error) {
      console.error('Claim miner failed:', error);
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Failed to claim miner NFT.',
      });
    } finally {
      setTxInFlight(null);
    }
  };

  const handleStartMining = async () => {
    try {
      setTxInFlight('start');
      resetFeedback();
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer unavailable');
      }
      const minerContract = new Contract(MINER_CONTRACT.address, MINER_CONTRACT.abi, signer);
      const tx = await minerContract.startMining();
      await tx.wait();
      await refetchSnapshot();
      setFeedback({ tone: 'success', message: 'Mining session started.' });
    } catch (error) {
      console.error('Start mining failed:', error);
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to start mining.',
      });
    } finally {
      setTxInFlight(null);
    }
  };

  const handleStopMining = async () => {
    try {
      setTxInFlight('stop');
      resetFeedback();
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer unavailable');
      }
      const minerContract = new Contract(MINER_CONTRACT.address, MINER_CONTRACT.abi, signer);
      const tx = await minerContract.stopMining();
      await tx.wait();
      await refetchSnapshot();
      setFeedback({ tone: 'success', message: 'Mining paused successfully.' });
    } catch (error) {
      console.error('Stop mining failed:', error);
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to pause mining.',
      });
    } finally {
      setTxInFlight(null);
    }
  };

  const handleWithdrawRewards = async () => {
    try {
      setTxInFlight('withdraw');
      resetFeedback();
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer unavailable');
      }
      const minerContract = new Contract(MINER_CONTRACT.address, MINER_CONTRACT.abi, signer);
      const tx = await minerContract.withdrawRewards();
      await tx.wait();
      await Promise.all([refetchSnapshot(), refetchBalance()]);
      setFeedback({ tone: 'success', message: 'Rewards withdrawn to your cZama balance.' });
    } catch (error) {
      console.error('Withdraw rewards failed:', error);
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to withdraw rewards.',
      });
    } finally {
      setTxInFlight(null);
    }
  };

  const handlePurchasePower = () => {
    setFeedback({ tone: 'info', message: 'Power upgrade feature is under development. 敬请期待。' });
  };

  if (!accountAddress) {
    return (
      <div className="miner-app__placeholder">
        <h2 className="miner-app__title">Connect your wallet</h2>
        <p className="miner-app__description">
          Claim a confidential miner NFT to start generating cZama tokens with fully encrypted compute power.
        </p>
      </div>
    );
  }

  if (instanceError) {
    return (
      <div className="miner-app__placeholder">
        <h2 className="miner-app__title">Encryption service unavailable</h2>
        <p className="miner-app__description miner-app__description--error">
          {instanceError}
        </p>
      </div>
    );
  }

  return (
    <div className="miner-app">
      {!hasMiner && (
        <section className="section-card">
          <h2 className="section-card__title">Claim your Miner NFT</h2>
          <p className="section-card__description">
            Each wallet can mint a single miner NFT with confidential compute power between 10 and 100. Start mining
            cZama once your miner is ready.
          </p>
          <button
            className="primary-button"
            onClick={handleClaim}
            disabled={txInFlight !== null || isFetchingMinerId || isInstanceLoading}
          >
            {txInFlight === 'claim' ? 'Claiming...' : 'Claim Miner'}
          </button>
        </section>
      )}

      {hasMiner && (
        <>
          <section className="section-card">
            <div className="section-card__header">
              <h2 className="section-card__title">Miner Overview</h2>
              <button
                className="secondary-button"
                onClick={handleDecryptValues}
                disabled={!canDecrypt || decrypting}
              >
                {decrypting ? 'Decrypting…' : 'Decrypt Miner Data'}
              </button>
            </div>
            <p className="section-card__description">
              Your compute power and rewards stay encrypted until you decrypt them. Click the button to reveal the
              latest confidential stats.
            </p>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-card__label">Compute Power</span>
                <span className="stat-card__value">
                  {decrypting && powerValue === null ? 'Decrypting…' : powerValue !== null ? powerValue.toString() : '—'}
                </span>
                <span className="stat-card__meta">
                  Daily yield: {powerValue !== null ? (powerValue * 100n).toString() : '—'} cZama
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Mining Status</span>
                <span className={`stat-card__value ${miningActive ? 'stat-card__value--active' : 'stat-card__value--paused'}`}>
                  {miningActive ? 'Active' : 'Paused'}
                </span>
                <span className="stat-card__meta">Updated: {formatTimestamp(lastUpdate)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">cZama Balance</span>
                <span className="stat-card__value">
                  {decrypting && balanceValue === null ? 'Decrypting…' : balanceValue !== null ? balanceValue.toString() : '—'}
                </span>
                <span className="stat-card__meta">Spendable in future upgrades</span>
              </div>
            </div>
            {decryptError && <p className="miner-app__decrypt-error">{decryptError}</p>}
          </section>

          <section className="section-card">
            <div className="section-card__header">
              <div>
                <h3 className="section-card__title">Mining Controls</h3>
                <p className="section-card__description">
                  Start or pause mining at any time. Rewards accrue while mining is active.
                </p>
              </div>
            </div>
            <div className="button-group">
              <button
                className="primary-button"
                onClick={handleStartMining}
                disabled={miningActive || txInFlight !== null}
              >
                {txInFlight === 'start' ? 'Starting…' : 'Start Mining'}
              </button>
              <button
                className="secondary-button"
                onClick={handleStopMining}
                disabled={!miningActive || txInFlight !== null}
              >
                {txInFlight === 'stop' ? 'Pausing…' : 'Pause Mining'}
              </button>
            </div>
          </section>

          <section className="section-card">
            <h3 className="section-card__title">Rewards</h3>
            <p className="section-card__description">
              Pending rewards accumulate daily at power × 100 cZama. Withdraw anytime to move them to your balance.
            </p>
            <div className="reward-display">
              <div>
                <span className="reward-display__label">Pending Rewards</span>
                <span className="reward-display__value">
                  {decrypting && pendingValue === null ? 'Decrypting…' : pendingValue !== null ? pendingValue.toString() : '—'}
                </span>
              </div>
              <button
                className="primary-button"
                onClick={handleWithdrawRewards}
                disabled={
                  txInFlight !== null || pendingValue === null || pendingValue === 0n || decrypting
                }
              >
                {txInFlight === 'withdraw' ? 'Withdrawing…' : 'Withdraw Rewards'}
              </button>
            </div>
          </section>
        </>
      )}

      <section className="section-card section-card--muted">
        <h3 className="section-card__title">Purchase Compute Power</h3>
        <p className="section-card__description">
          Spend cZama to boost your miner&apos;s compute power and increase yields. Feature is currently being built.
        </p>
        <button className="secondary-button" onClick={handlePurchasePower}>
          Purchase Power (开发中)
        </button>
      </section>

      {feedback && (
        <div className={`feedback feedback--${feedback.tone}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
}
