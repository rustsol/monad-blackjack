import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { contractService } from './utils/contractService';
import { ethers } from 'ethers';
import './index.css';

// Card component for display
const Card: React.FC<{card: {suit: number, value: number}, hidden?: boolean}> = ({card, hidden}) => {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  if (hidden) {
    return (
      <div className="card card-hidden">
        <div className="card-back">🎴</div>
      </div>
    );
  }
  
  return (
    <div className={`card ${card.suit === 1 || card.suit === 2 ? 'red' : 'black'}`}>
      <div className="card-value">{values[card.value]}</div>
      <div className="card-suit">{suits[card.suit]}</div>
    </div>
  );
};

// Main game component using REAL contract
const BlockchainBlackjackGame: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [gameState, setGameState] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [betAmount, setBetAmount] = useState('0.01');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        // Get provider and signer from window.ethereum
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          const signer = await provider.getSigner();
          await contractService.initialize(signer);
          console.log('🔗 Contract initialized with deployed address:', contractService.getContractAddress());
          
          // Load initial game state and stats
          await loadGameData();
        }
      } catch (error) {
        console.error('Failed to initialize contract:', error);
        setError('Failed to connect to blockchain contract');
      }
    };

    if (walletAddress) {
      initContract();
    }
  }, [walletAddress]);

  const loadGameData = async () => {
    try {
      const [gameState, playerStats] = await Promise.all([
        contractService.getGameState(walletAddress),
        contractService.getPlayerStats(walletAddress)
      ]);
      setGameState(gameState);
      setPlayerStats(playerStats);
    } catch (error) {
      console.error('Failed to load game data:', error);
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🎮 Starting REAL blockchain game with bet: ${betAmount} MON`);
      const tx = await contractService.startGame(betAmount);
      setTxHash(tx.hash);
      
      console.log(`📤 Transaction sent: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      console.log('✅ Game started on blockchain!');
      
      // Reload game state
      await loadGameData();
      
    } catch (error: any) {
      console.error('Failed to start game:', error);
      setError(`Transaction failed: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const hit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🃏 Hitting on blockchain...');
      const tx = await contractService.hit();
      setTxHash(tx.hash);
      
      console.log(`📤 Hit transaction: ${tx.hash}`);
      await tx.wait();
      
      console.log('✅ Hit executed on blockchain!');
      await loadGameData();
      
    } catch (error: any) {
      console.error('Failed to hit:', error);
      setError(`Transaction failed: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const stand = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('✋ Standing on blockchain...');
      const tx = await contractService.stand();
      setTxHash(tx.hash);
      
      console.log(`📤 Stand transaction: ${tx.hash}`);
      await tx.wait();
      
      console.log('✅ Stand executed on blockchain!');
      await loadGameData();
      
    } catch (error: any) {
      console.error('Failed to stand:', error);
      setError(`Transaction failed: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const doubleDown = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💰 Doubling down on blockchain...');
      const tx = await contractService.doubleDown(betAmount);
      setTxHash(tx.hash);
      
      console.log(`📤 Double down transaction: ${tx.hash}`);
      await tx.wait();
      
      console.log('✅ Double down executed on blockchain!');
      await loadGameData();
      
    } catch (error: any) {
      console.error('Failed to double down:', error);
      setError(`Transaction failed: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const calculateHandValue = (cards: Array<{suit: number, value: number}>) => {
    let total = 0;
    let aces = 0;
    
    for (const card of cards) {
      if (card.value === 1) { // Ace
        aces++;
        total += 11;
      } else if (card.value > 10) { // Face cards
        total += 10;
      } else {
        total += card.value;
      }
    }
    
    // Convert Aces from 11 to 1 if needed
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    
    return total;
  };

  const getGameStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Playing';
      case 1: return '🎉 You Won!';
      case 2: return '😔 Dealer Won';
      case 3: return '🤝 Push (Tie)';
      default: return 'Unknown';
    }
  };

  if (!contractService.isInitialized()) {
    return (
      <div className="loading-screen">
        <h2>🔗 Connecting to Blockchain...</h2>
        <p>Contract: {contractService.getContractAddress()}</p>
        <p>Initializing real blockchain connection...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>🎴 Monad Blackjack - LIVE ON BLOCKCHAIN</h1>
        <div className="wallet-info">
          <span>👤 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          <div className="contract-info">
            📝 Contract: {contractService.getContractAddress().slice(0, 10)}...
          </div>
        </div>
      </header>

      {txHash && (
        <div className="transaction-info">
          🔗 Last Transaction: <a href={`https://testnet.monadexplorer.com/tx/${txHash}`} target="_blank">{txHash.slice(0, 20)}...</a>
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="stats-bar">
        {playerStats && (
          <>
            <div>🎯 Games: {playerStats.totalGames}</div>
            <div>🏆 Wins: {playerStats.wins}</div>
            <div>💔 Losses: {playerStats.losses}</div>
            <div>🤝 Pushes: {playerStats.pushes}</div>
            <div>🔥 Streak: {playerStats.currentStreak}</div>
            <div>💰 Total Won: {parseFloat(playerStats.totalWon).toFixed(4)} MON</div>
          </>
        )}
      </div>

      <div className="game-board">
        {/* Dealer Section */}
        <div className="dealer-section">
          <h3>🎭 Dealer {gameState?.dealerCards && `(${calculateHandValue(gameState.dealerCards)})`}</h3>
          <div className="cards">
            {gameState?.dealerCards?.map((card: any, index: number) => (
              <Card key={index} card={card} hidden={!gameState.dealerTurn && index === 1} />
            ))}
            {!gameState?.dealerCards?.length && <div className="no-cards">Waiting for game...</div>}
          </div>
        </div>

        {/* Game Status */}
        <div className="game-status">
          {gameState?.isActive ? (
            <span className="status-active">🎯 {getGameStatusText(gameState.gameStatus)}</span>
          ) : (
            <span className="status-waiting">Ready to play on blockchain!</span>
          )}
          {gameState?.bet && gameState.bet !== '0' && (
            <div className="current-bet">💰 Bet: {parseFloat(gameState.bet).toFixed(4)} MON</div>
          )}
        </div>

        {/* Player Section */}
        <div className="player-section">
          <h3>👤 You {gameState?.playerCards && `(${calculateHandValue(gameState.playerCards)})`}</h3>
          <div className="cards">
            {gameState?.playerCards?.map((card: any, index: number) => (
              <Card key={index} card={card} />
            ))}
            {!gameState?.playerCards?.length && <div className="no-cards">Ready for cards...</div>}
          </div>
        </div>

        {/* Game Controls */}
        <div className="game-controls">
          {!gameState?.isActive ? (
            <div className="bet-controls">
              <div className="bet-input-group">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.001"
                  max="1"
                  step="0.001"
                  disabled={isLoading}
                  className="bet-input"
                />
                <span>MON</span>
              </div>
              <button
                onClick={startGame}
                disabled={isLoading || !betAmount}
                className="btn btn-primary btn-start"
              >
                {isLoading ? '⏳ Starting...' : '🚀 Start Game (Blockchain)'}
              </button>
            </div>
          ) : (
            <div className="action-buttons">
              <button
                onClick={hit}
                disabled={isLoading || gameState.dealerTurn}
                className="btn btn-secondary"
              >
                {isLoading ? '⏳' : '🃏 Hit'}
              </button>
              <button
                onClick={stand}
                disabled={isLoading || gameState.dealerTurn}
                className="btn btn-warning"
              >
                {isLoading ? '⏳' : '✋ Stand'}
              </button>
              {gameState.playerCards?.length === 2 && (
                <button
                  onClick={doubleDown}
                  disabled={isLoading || gameState.dealerTurn}
                  className="btn btn-info"
                >
                  {isLoading ? '⏳' : '💰 Double Down'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner">⏳</div>
            <p>Processing blockchain transaction...</p>
            <p>Every move is recorded on Monad testnet!</p>
          </div>
        </div>
      )}

      <footer className="game-footer">
        <p>⛓️ Every move is a real transaction on Monad blockchain</p>
        <p>🎮 Integrated with Monad Games ID for cross-game leaderboards</p>
        <p>🏆 No dummy data - everything is live and dynamic!</p>
      </footer>
    </div>
  );
};

// Authentication wrapper
const AuthWrapper: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && user && wallets.length > 0) {
      // Get the connected wallet address
      const connectedWallet = wallets.find(wallet => wallet.address);
      if (connectedWallet) {
        setWalletAddress(connectedWallet.address);
        console.log('🔗 Connected wallet:', connectedWallet.address);
      }
    }
  }, [authenticated, user, wallets]);

  if (!ready) {
    return (
      <div className="loading-screen">
        <h2>🎴 Monad Blackjack</h2>
        <p>Loading Privy...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <div className="auth-header">
            <h1>🎴 Monad Blackjack</h1>
            <p>Real blockchain gaming with Monad Games ID</p>
          </div>
          <button onClick={login} className="btn btn-primary btn-large">
            🎮 Connect with Monad Games ID
          </button>
          <div className="auth-features">
            <p>✅ Every move recorded on blockchain</p>
            <p>✅ Real MON token transactions</p>
            <p>✅ Cross-game leaderboard integration</p>
            <p>✅ No dummy data - everything is live!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="loading-screen">
        <h2>🔗 Connecting Wallet...</h2>
        <p>Getting wallet address...</p>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </div>
    );
  }

  return (
    <div>
      <BlockchainBlackjackGame walletAddress={walletAddress} />
      <div className="logout-section">
        <button onClick={logout} className="btn btn-outline">🚪 Logout</button>
      </div>
    </div>
  );
};

// Main App with Privy provider
const App: React.FC = () => {
  const privyAppId = process.env.REACT_APP_PRIVY_APP_ID;
  
  if (!privyAppId) {
    return (
      <div className="error-screen">
        <h1>❌ Configuration Error</h1>
        <p>REACT_APP_PRIVY_APP_ID not set in .env file</p>
        <p>Current contract: {process.env.REACT_APP_CONTRACT_ADDRESS}</p>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['wallet'],
          appearance: {
            theme: 'dark',
            accentColor: '#6366f1',
            logo: '🎴',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <AuthWrapper />
      </PrivyProvider>
    </Provider>
  );
};

export default App;