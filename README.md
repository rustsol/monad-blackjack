# Monad Blackjack 🃏

A fully decentralized, onchain blackjack game built on **Monad Testnet** with complete **Monad Games ID** integration. Every card deal, bet, and game action is recorded on the blockchain with realtime leaderboards and crossgame identity.

## 🎮 Features

### 🔗 **Full Blockchain Integration**
All moves (hit, stand, double down) are blockchain transactions
Complete game logic runs on Monad smart contracts
Game state synchronized with blockchain
All games and results are publicly verifiable

### 🏆 **Monad Games ID Integration**
Use your Monad Games ID username across all games
Compete with players on global leaderboard
Usernames displayed in leaderboards and game history

### 🎯 **Advanced Game Features**
Hit, stand, double down, natural blackjack
Smooth card dealing with sound effects
Premium visual effects and animations
Win rates, streaks, profit/loss tracking
Realtime rankings with multiple sorting options


## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16+ recommended)
- **NPM** or **Yarn**
- **MetaMask** or compatible wallet, you privy or reown wallet libraries. 
- **Monad Testnet MON tokens** 

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/monad-blackjack.git
cd monad-blackjack
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Frontend Configuration  
REACT_APP_PRIVY_APP_ID=your_privy_app_id
REACT_APP_CONTRACT_ADDRESS=0x543629E3b3da3044E95345a377CEFBEE1e31445B

# Monad Games ID Integration (Pre-configured)
REACT_APP_MONAD_GAMES_ID_CONTRACT=0xceCBFF203C8B6044F52CE23D914A1bfD997541A4
REACT_APP_MONAD_GAMES_CROSS_APP_ID=cmd8euall0037le0my79qpz42

# Network Configuration
REACT_APP_RPC_URL=https://monad-testnet.drpc.org
REACT_APP_CHAIN_ID=41454

# Development Settings
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
```

**⚠️ Note**: You only need to set `REACT_APP_PRIVY_APP_ID` from your [Privy Dashboard](https://dashboard.privy.io/). The contract is already deployed and ready to use.

### 4. Get Privy App ID

1. **Visit**: [Privy Dashboard](https://dashboard.privy.io/)
2. **Create new app** or use existing one
3. **Copy App ID** from dashboard
4. **Add to .env**: Set `REACT_APP_PRIVY_APP_ID=your_app_id`

### 5. Smart Contract (Already Deployed)

The game uses a **pre-deployed contract** at:
```
0x543629E3b3da3044E95345a377CEFBEE1e31445B
```

No deployment needed! The contract is funded and ready for gameplay.

### 6. Start Development Server
```bash
npm start
```

The game will be available at `http://localhost:3001`

## 🎮 How to Play

### 1. **Connect Wallet**
- Connect Privy
- Ensure you have MON tokens on Monad Testnet
- Sign in with Monad Games ID for username features

### 2. **Register Monad Games ID** (Optional but Recommended)
- Visit: https://monad-games-id-site.vercel.app/
- Register a unique username
- Your username will appear on leaderboards across all games

### 3. **Start Playing**
- Set your bet amount (0.001 - 1 MON)
- Click "Deal Cards" to start a new game
- Use Hit, Stand, or Double Down based on your strategy
- All actions require blockchain confirmations

### 4. **Game Rules**
- **Objective**: Get as close to 21 without busting
- **Card Values**: A=1/11, Face cards=10, Numbers=face value
- **Natural Blackjack**: Ace + 10-value card = instant win
- **Double Down**: Double bet and receive exactly one more card
- **Push**: Tie with dealer = bet returned

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **Privy** for authentication and wallet management
- **Ethers.js** for blockchain interactions
- **React Router** for navigation
- **Tailwind CSS** for styling

### **Blockchain Components**
- **Smart Contract**: Solidity 0.8.19
- **Network**: Monad Testnet
- **Token**: MON (Monad native token)
- **Integration**: Monad Games ID Contract

### **Key Smart Contract Functions**
```solidity
function startGame() external payable;        // Start new game
function hit() external;                      // Request another card
function stand() external;                    // End player turn
function doubleDown() external payable;       // Double bet + one card
function getGameState(address) external view; // Get current game
function getPlayerStats(address) external view; // Get player statistics
```

## 🎯 Monad Games ID Integration

### **What is Monad Games ID?**
Monad Games ID is a cross-game identity system that allows players to:
- **Reserve unique usernames** that work across all integrated games
- **Build persistent gaming profiles** with stats and achievements  
- **Participate in unified leaderboards** spanning multiple games
- **Maintain consistent identity** throughout the gaming ecosystem

### **How It Works in This Game**

#### 1. **Authentication Flow**
```typescript
// User signs in with Monad Games ID via Privy
const crossAppAccount = user.linkedAccounts.find(
  account => account.providerApp?.id === 'cmd8euall0037le0my79qpz42'
);

// Extract embedded wallet address
const walletAddress = crossAppAccount.embeddedWallets[0].address;
```

#### 2. **Username Fetching**
```typescript
// Fetch username from Monad Games ID API
const response = await fetch(
  `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${address}`
);
const data = await response.json();
const username = data.hasUsername ? data.user.username : 'Anonymous';
```

#### 3. **Score Submission**
```typescript
// Submit scores to Monad Games ID contract
await monadGamesContract.updatePlayerData(
  playerAddress, 
  scoreAmount,     // Game-specific score
  transactionCount // Number of blockchain transactions
);
```

#### 4. **Leaderboard Integration**
- **Usernames displayed**: Players see readable names instead of addresses
- **Cross-game rankings**: Scores contribute to global Monad Games ecosystem
- **Real-time updates**: Leaderboards update with each game completion

### **Registration Process**
1. **Play without username**: Game works with wallet addresses
2. **Register username**: Visit https://monad-games-id-site.vercel.app/
3. **Link account**: Username automatically appears in future games
4. **Cross-game benefits**: Same username works across all Monad games

## 🏆 Leaderboard Features

### **Sorting Options**
- **Most Wins**: Total games won
- **Win Rate**: Percentage of games won
- **Net Profit**: Total MON earned minus wagered
- **Best Streak**: Longest consecutive win streak

### **Player Badges**
- 🎯 **Sharp**: Win rate ≥ 60%
- 🔥 **Hot**: Best streak ≥ 10 games
- 💰 **Whale**: Net profit ≥ 10 MON
- ⭐ **Veteran**: Total games ≥ 100
- 💎 **Pro**: 10+ games with 50%+ win rate

### **Real-time Updates**
- Automatic refresh after each game
- Live blockchain data integration
- Cross-game score aggregation

## 🔧 Development

### **Project Structure**
```
monad-blackjack/
├── src/
│   ├── components/          # React components
│   │   ├── GlobalLeaderboard.tsx
│   │   ├── GameBoard.tsx
│   │   └── PlayerStats.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── usePrivyAuth.tsx
│   │   └── useContractEvents.tsx
│   ├── store/               # Redux store
│   │   ├── authSlice.ts
│   │   ├── gameSlice.ts
│   │   └── casinoSlice.ts
│   ├── utils/               # Utilities
│   │   ├── contractService.ts
│   │   └── soundManager.ts
│   └── styles/              # CSS files
├── contracts/               # Smart contracts
│   └── BlackjackGame.sol
├── compiled-original/       # Compiled contract artifacts
└── scripts/                 # Deployment scripts
```

### **Key Components**

#### **ContractService** (`src/utils/contractService.ts`)
- Manages all blockchain interactions
- Handles contract initialization and function calls
- Provides error handling and transaction management

#### **usePrivyAuth Hook** (`src/hooks/usePrivyAuth.tsx`)
- Manages Monad Games ID authentication
- Extracts wallet addresses from cross-app accounts
- Handles username registration flow

#### **GlobalLeaderboard** (`src/components/GlobalLeaderboard.tsx`)
- Fetches player data from blockchain
- Integrates Monad Games ID usernames
- Provides real-time rankings and statistics

### **Smart Contract Overview**
The `BlackjackGame.sol` contract includes:
- **Game Logic**: Complete blackjack implementation
- **Random Card Generation**: On-chain randomness for fair play
- **Statistics Tracking**: Comprehensive player analytics
- **Event Emission**: Real-time game state updates
- **Monad Games ID Integration**: Score reporting to central contract

## 🌐 Deployment

### **Monad Testnet Configuration**
```javascript
// Network Details
Chain ID: 41454
RPC URL: https://monad-testnet.drpc.org
Currency: MON
Block Explorer: https://testnet.monadexplorer.com/
```

### **Contract Deployment**
```bash
# Deploy new contract
node deploy-original.cjs

# Verify deployment
npx hardhat verify --network monad CONTRACT_ADDRESS MONAD_GAMES_ID_ADDRESS
```

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Deploy to hosting service
# Upload build/ directory to your preferred hosting platform
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Commit changes**: `git commit -m 'Add new feature'`
4. **Push to branch**: `git push origin feature/new-feature`
5. **Submit Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure smart contract security

## 📜 License

This project is licensed under the **ISC License**.

## 🔗 Links

- **Live Game**: http://localhost:3003 (after setup)
- **Smart Contract**: [View on Monad Explorer](https://testnet.monadexplorer.com/address/0x543629E3b3da3044E95345a377CEFBEE1e31445B)
- **Monad Games ID**: https://monad-games-id-site.vercel.app/
- **Monad Testnet**: https://docs.monad.xyz/

## ⚠️ Disclaimer

This is a **testnet game** for demonstration purposes. Use testnet MON tokens only. No real monetary value is involved. Always verify smart contract interactions before confirming transactions.

---

**Built with ❤️ for the Monad Ecosystem**
- **📊 Real-time Stats**: Track your performance and climb the leaderboard
- **🏆 Competitive Gaming**: Global leaderboard with usernames
- **💎 Smart Contract**: Fully auditable game logic on-chain

## 🏗️ Architecture

### Smart Contract (`BlackjackGame.sol`)
- Game state management
- Card dealing with verifiable randomness
- Automatic payouts and scoring
- Monad Games ID integration
- Player statistics tracking

### Frontend (React + Redux)
- **Redux Store**: Centralized game state management
- **Real-time Events**: Live contract event listening
- **Privy Authentication**: Monad Games ID integration
- **Responsive Design**: Mobile-first approach
- **Wallet Integration**: Seamless Web3 experience

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Monad testnet MON tokens
- Privy App ID
- Private key for deployment

### 1. Clone and Install
```bash
git clone <repository>
cd monad-blackjack
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```env
# Required for deployment
PRIVATE_KEY=your_private_key_here

# Required for frontend
REACT_APP_PRIVY_APP_ID=your_privy_app_id_here
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address_here
```

### 3. Deploy Smart Contract
```bash
# Compile contracts
npm run compile

# Deploy to Monad testnet
npm run deploy
```

### 4. Register with Monad Games ID
```bash
# Update the script with your details
npx hardhat run scripts/register-game.ts --network monad
```

### 5. Start the Application
```bash
npm start
```

Visit `http://localhost:3000` to start playing!

## 🎮 How to Play

1. **Connect Wallet**: Sign in with Monad Games ID
2. **Place Bet**: Choose your bet amount (0.001 - 1 MON)
3. **Play**: Hit, Stand, or Double Down
4. **Win**: Receive automatic payouts
5. **Compete**: Climb the global leaderboard

## 📋 Game Rules

- **Blackjack**: 21 with 2 cards pays 3:2
- **Win**: Beat the dealer without busting
- **Bust**: Hand value over 21 loses
- **Push**: Tie returns your bet
- **Dealer**: Hits on 16, stands on 17

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy contracts
- `npm test` - Run tests

### Project Structure
```
monad-blackjack/
├── contracts/          # Smart contracts
├── scripts/           # Deployment scripts
├── src/
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── store/         # Redux store
│   ├── types/         # TypeScript types
│   └── utils/         # Utilities
└── public/           # Static assets
```

## 🌟 Key Technologies

- **Blockchain**: Solidity smart contracts on Monad
- **Frontend**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **Authentication**: Privy + Monad Games ID
- **Styling**: Tailwind CSS + Custom CSS
- **Build Tools**: React Scripts + Hardhat

## 🏆 Monad Games ID Integration

This game fully integrates with Monad Games ID:

- ✅ **Game Registration**: Registered on-chain
- ✅ **User Authentication**: Privy cross-app accounts
- ✅ **Username Display**: API integration
- ✅ **Score Submission**: Automatic on win/loss
- ✅ **Transaction Tracking**: Every move recorded
- ✅ **Leaderboard Ready**: Cross-game compatibility

## 📊 Smart Contract Details

**Contract Address**: `TBD` (deployed on Monad testnet)
**Monad Games ID**: `0xceCBFF203C8B6044F52CE23D914A1bfD997541A4`

### Key Functions
- `startGame()` - Begin new game with bet
- `hit()` - Request another card  
- `stand()` - End player turn
- `doubleDown()` - Double bet and take one card
- `getGameState()` - Get current game state
- `getPlayerStats()` - Get player statistics

## 🔐 Security

- Smart contract handles all game logic
- Verifiable on-chain randomness
- Automatic payouts prevent manipulation
- No client-side game state modification

## 🚀 Deployment

The game is ready for production deployment:

1. Deploy smart contract to Monad mainnet
2. Register with Monad Games ID
3. Update environment variables
4. Build and deploy frontend
5. Fund contract for payouts

## 📜 License

Open source - built for Monad Games ID Mission 7

## 🤝 Contributing

This is a hackathon project for Monad Games ID Mission 7. Feel free to fork and improve!

---

**🎴 Built with ❤️ for the Monad ecosystem**

*Experience the future of blockchain gaming where every move matters and every game is verifiable.*