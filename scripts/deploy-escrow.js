const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DomeraEscrow contract...");
  
  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Kleros Arbitrator address for Arbitrum Sepolia
  // This is the actual Kleros arbitrator address for Arbitrum Sepolia testnet
  const KLEROS_ARBITRATOR = "0x1128eD55ab2d796fa92D2F8E1f336d745354a77A"; // Kleros Arbitrator on Arbitrum Sepolia
  const ARBITRATOR_EXTRA_DATA = "0x00"; // Standard extra data
  
  // Deploy DomeraEscrow
  const DomeraEscrow = await ethers.getContractFactory("DomeraEscrow");
  const domeraEscrow = await DomeraEscrow.deploy(
    KLEROS_ARBITRATOR,
    ARBITRATOR_EXTRA_DATA
  );
  
  await domeraEscrow.waitForDeployment();
  const domeraEscrowAddress = await domeraEscrow.getAddress();
  
  console.log("DomeraEscrow deployed to:", domeraEscrowAddress);
  console.log("Arbitrator:", KLEROS_ARBITRATOR);
  console.log("Extra Data:", ARBITRATOR_EXTRA_DATA);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    domeraEscrow: domeraEscrowAddress,
    arbitrator: KLEROS_ARBITRATOR,
    extraData: ARBITRATOR_EXTRA_DATA,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verify contract if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await domeraEscrow.deploymentTransaction().wait(5);
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: domeraEscrowAddress,
        constructorArguments: [KLEROS_ARBITRATOR, ARBITRATOR_EXTRA_DATA]
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });