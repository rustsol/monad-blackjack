import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BlackjackGame contract to Monad testnet...");

  // Monad Games ID contract address on testnet
  const monadGamesIDContract = "0xceCBFF203C8B6044F52CE23D914A1bfD997541A4";

  // Deploy the contract
  const BlackjackGame = await ethers.getContractFactory("BlackjackGame");
  const blackjackGame = await BlackjackGame.deploy(monadGamesIDContract);

  await blackjackGame.waitForDeployment();
  const contractAddress = await blackjackGame.getAddress();

  console.log(`BlackjackGame deployed to: ${contractAddress}`);
  console.log(`Monad Games ID integration: ${monadGamesIDContract}`);
  
  console.log("\n🎉 Deployment completed!");
  console.log("\nNext steps:");
  console.log("1. Add the contract address to your .env file:");
  console.log(`   REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Register your game with Monad Games ID using the registerGame function");
  console.log("3. Fund the contract with some MON for payouts");
  
  // Verify the contract (optional)
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("\nVerifying contract on explorer...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [monadGamesIDContract],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });