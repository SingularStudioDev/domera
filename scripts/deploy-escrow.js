const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DomeraEscrow contract...");
  
  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Arbitrum Sepolia Kleros addresses (we'll use a mock arbitrator for now)
  // In production, replace with actual Kleros arbitrator address
  const MOCK_ARBITRATOR = "0x1234567890123456789012345678901234567890"; // Replace with real Kleros arbitrator
  const ARBITRATOR_EXTRA_DATA = "0x00"; // Standard extra data
  
  // Deploy DomeraEscrow
  const DomeraEscrow = await ethers.getContractFactory("DomeraEscrow");
  const domeraEscrow = await DomeraEscrow.deploy(
    MOCK_ARBITRATOR,
    ARBITRATOR_EXTRA_DATA
  );
  
  await domeraEscrow.waitForDeployment();
  const domeraEscrowAddress = await domeraEscrow.getAddress();
  
  console.log("DomeraEscrow deployed to:", domeraEscrowAddress);
  console.log("Arbitrator:", MOCK_ARBITRATOR);
  console.log("Extra Data:", ARBITRATOR_EXTRA_DATA);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    domeraEscrow: domeraEscrowAddress,
    arbitrator: MOCK_ARBITRATOR,
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
        constructorArguments: [MOCK_ARBITRATOR, ARBITRATOR_EXTRA_DATA]
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