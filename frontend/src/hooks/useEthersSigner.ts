import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, type Eip1193Provider } from 'ethers';
import type { WalletClient } from 'viem';

function walletClientToSigner(walletClient: WalletClient): Promise<JsonRpcSigner> {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new BrowserProvider(transport as unknown as Eip1193Provider, network);
  return provider.getSigner(account.address);
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });

  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}
