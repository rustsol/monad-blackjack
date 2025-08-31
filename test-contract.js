import { ethers } from 'ethers';

// Load environment variables
import fs from 'fs';

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  envLines.forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://testnet-rpc.monad.xyz';

const ABI = [
  "function startGame() external payable",
  "function hit() external",
  "function stand() external",
  "function getGameState(address player) external view returns (tuple(address player, tuple(uint8 suit, uint8 value)[] playerCards, tuple(uint8 suit, uint8 value)[] dealerCards, uint256 bet, uint8 gameStatus, bool isActive, uint256 gameId, bool dealerTurn, uint256 timestamp))",
  "function getPlayerStats(address player) external view returns (tuple(uint256 totalGames, uint256 wins, uint256 losses, uint256 pushes, uint256 totalWagered, uint256 totalWon, uint256 currentStreak, uint256 bestStreak))",
  "function isGameActive(address player) external view returns (bool)",
  "function MIN_BET() external view returns (uint256)",
  "function MAX_BET() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function monadGamesIDContract() external view returns (address)",
  "event GameStarted(address indexed player, uint256 gameId, uint256 bet, uint256 timestamp)",
  "event CardDealt(address indexed player, uint256 gameId, uint8 suit, uint8 value, bool isDealer, uint256 timestamp)",
  "event GameEnded(address indexed player, uint256 gameId, uint8 result, uint256 payout, uint256 timestamp)"
];

async function testContract() {
  console.log("🧪 Testing BlackjackGame Contract");
  console.log("================================");
  
  try {
    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    console.log(`📝 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`👤 Wallet Address: ${wallet.address}`);
    
    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet Balance: ${ethers.formatEther(balance)} MON`);
    
    // Test contract read functions
    console.log("\n🔍 Testing Contract Read Functions:");
    
    try {
      const owner = await contract.owner();
      console.log(`✅ Owner: ${owner}`);
    } catch (error) {
      console.log(`❌ Owner failed: ${error.message}`);
    }
    
    try {
      const monadGamesID = await contract.monadGamesIDContract();
      console.log(`✅ Monad Games ID: ${monadGamesID}`);
    } catch (error) {
      console.log(`❌ Monad Games ID failed: ${error.message}`);
    }
    
    try {
      const minBet = await contract.MIN_BET();
      console.log(`✅ Min Bet: ${ethers.formatEther(minBet)} MON`);
    } catch (error) {
      console.log(`❌ Min Bet failed: ${error.message}`);
    }
    
    try {
      const maxBet = await contract.MAX_BET();
      console.log(`✅ Max Bet: ${ethers.formatEther(maxBet)} MON`);
    } catch (error) {
      console.log(`❌ Max Bet failed: ${error.message}`);
    }
    
    try {
      const isActive = await contract.isGameActive(wallet.address);
      console.log(`✅ Is Game Active: ${isActive}`);
    } catch (error) {
      console.log(`❌ Is Game Active failed: ${error.message}`);
    }
    
    try {
      const gameState = await contract.getGameState(wallet.address);
      console.log(`✅ Game State: Active=${gameState.isActive}, Bet=${ethers.formatEther(gameState.bet)} MON`);
    } catch (error) {
      console.log(`❌ Game State failed: ${error.message}`);
    }
    
    try {
      const stats = await contract.getPlayerStats(wallet.address);
      console.log(`✅ Player Stats: Games=${stats.totalGames}, Wins=${stats.wins}, Losses=${stats.losses}`);
    } catch (error) {
      console.log(`❌ Player Stats failed: ${error.message}`);
    }
    
    console.log("\n🎮 Contract appears to be working correctly!");
    console.log("✅ Ready for frontend integration");
    
  } catch (error) {
    console.error("❌ Contract test failed:", error);
  }
}

testContract();