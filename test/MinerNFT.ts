import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("MinerNFT", function () {
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;

  before(async function () {
    [deployer, alice] = await ethers.getSigners();
  });

  async function deployContracts() {
    const tokenFactory = await ethers.getContractFactory("ConfidentialZama", deployer);
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();

    const minerFactory = await ethers.getContractFactory("MinerNFT", deployer);
    const miner = await minerFactory.deploy(await token.getAddress());
    await miner.waitForDeployment();

    await (await token.setMinerManager(await miner.getAddress())).wait();

    return { token, miner };
  }

  beforeEach(function () {
    if (!fhevm.isMock) {
      console.warn("Skipping MinerNFT tests on non-mock network");
      this.skip();
    }
  });

  it("allows a single miner claim per address and assigns encrypted power", async function () {
    const { miner } = await deployContracts();
    const aliceAddress = await alice.getAddress();

    const claimTx = await miner.connect(alice).claimMiner();
    await claimTx.wait();

    const ownedTokenId = await miner.minerIdOf(aliceAddress);
    const totalMiners = await miner.totalMiners();
    expect(ownedTokenId).to.equal(totalMiners);

    const snapshot = await miner.getMinerSnapshot(ownedTokenId);
    const decryptedPower = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      snapshot[0],
      await miner.getAddress(),
      alice,
    );

    const powerValue = BigInt(decryptedPower.toString());
    expect(powerValue).to.be.gte(10n);
    expect(powerValue).to.be.lte(100n);

    await expect(miner.connect(alice).claimMiner()).to.be.revertedWithCustomError(miner, "MinerAlreadyClaimed");
  });

  it("accrues rewards while mining and mints cZama on withdrawal", async function () {
    const { miner, token } = await deployContracts();
    const minerAddress = await miner.getAddress();
    const tokenAddress = await token.getAddress();
    const aliceAddress = await alice.getAddress();

    const claimTx = await miner.connect(alice).claimMiner();
    await claimTx.wait();
    const tokenId = await miner.minerIdOf(aliceAddress);

    await (await miner.connect(alice).startMining()).wait();

    const snapshotAfterStart = await miner.getMinerSnapshot(tokenId);
    const power = BigInt(
      (await fhevm.userDecryptEuint(FhevmType.euint16, snapshotAfterStart[0], minerAddress, alice)).toString(),
    );

    await ethers.provider.send("evm_increaseTime", [86400 * 2]);
    await ethers.provider.send("evm_mine", []);

    const expectedReward = power * 100n * 2n;

    const withdrawTx = await miner.connect(alice).withdrawRewards();
    await withdrawTx.wait();

    const balanceCipher = await token.confidentialBalanceOf(aliceAddress);
    const decryptedBalance = BigInt(
      (await fhevm.userDecryptEuint(FhevmType.euint64, balanceCipher, tokenAddress, alice)).toString(),
    );
    expect(decryptedBalance).to.equal(expectedReward);

    const pendingCipher = await miner.minerPendingRewards(tokenId);
    const decryptedPending = BigInt(
      (await fhevm.userDecryptEuint(FhevmType.euint64, pendingCipher, minerAddress, alice)).toString(),
    );
    expect(decryptedPending).to.equal(0n);
  });
});
