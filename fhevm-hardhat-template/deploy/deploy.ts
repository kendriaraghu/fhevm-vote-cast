import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFHEVoteCast: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying FHEVoteCast...");

  const fheVoteCast = await deploy("FHEVoteCast", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log(`FHEVoteCast deployed at: ${fheVoteCast.address}`);
  
  // Verify contract on Etherscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: fheVoteCast.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Contract verification failed:", error);
    }
  }
};

export default deployFHEVoteCast;
deployFHEVoteCast.tags = ["FHEVoteCast"];