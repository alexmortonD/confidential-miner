import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("miner:addresses", "Prints deployed miner contract addresses").setAction(async function (_: TaskArguments, hre) {
  const { deployments } = hre;

  const minerNFT = await deployments.get("MinerNFT");
  const token = await deployments.get("ConfidentialZama");

  console.log(`MinerNFT: ${minerNFT.address}`);
  console.log(`ConfidentialZama: ${token.address}`);
});

task("miner:claim", "Claims a miner NFT for the first available signer")
  .addOptionalParam("account", "Account that will claim the miner")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers } = hre;
    const minerDeployment = await deployments.get("MinerNFT");
    const miner = await ethers.getContractAt("MinerNFT", minerDeployment.address);

    const account = taskArguments.account ? await ethers.getSigner(taskArguments.account) : (await ethers.getSigners())[0];

    const tx = await miner.connect(account).claimMiner();
    const receipt = await tx.wait();
    console.log(`Miner claimed in tx: ${receipt?.hash}`);
  });

task("miner:status", "Decrypts miner status and balances")
  .addOptionalParam("account", "Account to inspect")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers, fhevm } = hre;

    if (!fhevm.isMock) {
      await fhevm.initializeCLIApi();
    }

    const minerDeployment = await deployments.get("MinerNFT");
    const tokenDeployment = await deployments.get("ConfidentialZama");
    const miner = await ethers.getContractAt("MinerNFT", minerDeployment.address);
    const token = await ethers.getContractAt("ConfidentialZama", tokenDeployment.address);

    const accountSigner = taskArguments.account
      ? await ethers.getSigner(taskArguments.account)
      : (await ethers.getSigners())[0];
    const account = await accountSigner.getAddress();

    const minerId = await miner.minerIdOf(account);
    if (minerId === 0n) {
      console.log(`Account ${account} does not own a miner.`);
      return;
    }

    const snapshot = await miner.getMinerSnapshot(minerId);
    const decryptedPower = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      snapshot[0],
      minerDeployment.address,
      accountSigner,
    );
    const decryptedPending = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      snapshot[1],
      minerDeployment.address,
      accountSigner,
    );

    const balanceCipher = await token.confidentialBalanceOf(account);
    const decryptedBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      balanceCipher,
      tokenDeployment.address,
      accountSigner,
    );

    console.log(`Miner ID: ${minerId}`);
    console.log(`Power: ${decryptedPower}`);
    console.log(`Pending rewards: ${decryptedPending}`);
    console.log(`Mining active: ${snapshot[2]}`);
    console.log(`Last update: ${snapshot[3]}`);
    console.log(`cZama balance: ${decryptedBalance}`);
  });
