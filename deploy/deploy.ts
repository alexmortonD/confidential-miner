import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, execute } = hre.deployments;

  const confidentialZama = await deploy("ConfidentialZama", {
    from: deployer,
    log: true,
  });

  const minerNFT = await deploy("MinerNFT", {
    from: deployer,
    args: [confidentialZama.address],
    log: true,
  });

  await execute("ConfidentialZama", { from: deployer, log: true }, "setMinerManager", minerNFT.address);

  console.log(`ConfidentialZama: ${confidentialZama.address}`);
  console.log(`MinerNFT: ${minerNFT.address}`);
};
export default func;
func.id = "deploy_confidential_miner";
func.tags = ["ConfidentialMiner"];
