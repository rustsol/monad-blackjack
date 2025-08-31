import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { store } from './store';
import { contractService } from './utils/contractService';
import { ethers } from 'ethers';
import GlobalLeaderboard from './components/GlobalLeaderboard';
import './index.css';
import './blockchain-game.css';
import './styles/leaderboard.css';
import './styles/navigation.css';

// Card component
const Card: React.FC<{card: {suit: number, value: number}, hidden?: boolean}> = ({card, hidden}) => {
  // Match contract suit order: 0=Hearts, 1=Diamonds, 2=Clubs, 3=Spades
  const suits = ['♥️', '♦️', '♣️', '♠️'];
  const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  if (hidden) {
    return (
      <div className="card card-hidden">
        <div className="card-back">🎴</div>
      </div>
    );
  }
  
  return (
    <div className={`card ${card.suit <= 1 ? 'red' : 'black'}`}>
      <div className="card-value">{values[card.value]}</div>
      <div className="card-suit">{suits[card.suit]}</div>
    </div>
  );
};

// Game component
const BlackjackGame: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [gameState, setGameState] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [betAmount, setBetAmount] = useState('0.01');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          const signer = await provider.getSigner();
          await contractService.initialize(signer);
          await loadPlayerStats();
          await loadGameState();
        }
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError('Failed to connect to contract');
      }
    };
    initContract();
  }, [walletAddress]);

  const loadGameState = async () => {
    try {
      const contract = contractService.getContract();
      if (!contract) return;
      
      const state = await contract.getGameState(walletAddress);
      if (state.isActive) {
        const playerHand = state.playerCards.map((card: any) => ({
          suit: Number(card.suit),
          value: Number(card.value)
        }));
        const dealerHand = state.dealerCards.map((card: any) => ({
          suit: Number(card.suit), 
          value: Number(card.value)
        }));
        
        setGameState({
          isActive: state.isActive,
          playerHand,
          dealerHand,
          bet: ethers.formatEther(state.bet),
          gameStatus: Number(state.gameStatus),
          dealerTurn: state.dealerTurn
        });
      } else {
        setGameState(null);
      }
    } catch (err) {
      console.error('Failed to load game state:', err);
    }
  };

  const loadPlayerStats = async () => {
    try {
      const contract = contractService.getContract();
      if (!contract) return;
      
      const stats = await contract.getPlayerStats(walletAddress);
      setPlayerStats({
        totalGames: Number(stats.totalGames),
        wins: Number(stats.wins),
        losses: Number(stats.losses),
        pushes: Number(stats.pushes),
        totalWagered: ethers.formatEther(stats.totalWagered),
        totalWon: ethers.formatEther(stats.totalWon),
        currentStreak: Number(stats.currentStreak),
        bestStreak: Number(stats.bestStreak)
      });
    } catch (err) {
      console.error('Failed to load player stats:', err);
    }
  };

  const startNewGame = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contract = contractService.getContract();
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.startGame({ 
        value: ethers.parseEther(betAmount) 
      });
      setTxHash(tx.hash);
      await tx.wait();
      
      await loadGameState();
      await loadPlayerStats();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
      setTxHash(null);
    }
  };

  const playerHit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contract = contractService.getContract();
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.playerHit();
      setTxHash(tx.hash);
      await tx.wait();
      
      await loadGameState();
      await loadPlayerStats();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
      setTxHash(null);
    }
  };

  const playerStand = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contract = contractService.getContract();
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.playerStand();
      setTxHash(tx.hash);
      await tx.wait();
      
      await loadGameState();
      await loadPlayerStats();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
      setTxHash(null);
    }
  };

  const calculateHandValue = (hand: any[]) => {
    let value = 0;
    let aces = 0;
    
    for (const card of hand) {
      if (card.value === 1) {
        aces++;
        value += 11;
      } else if (card.value > 10) {
        value += 10;
      } else {
        value += card.value;
      }
    }
    
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };

  return (
    <div className="blockchain-blackjack">
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">⚡ Monad Blackjack</h1>
          <div className="wallet-info">
            <span className="wallet-label">Wallet:</span>
            <span className="wallet-address">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        </div>

        {playerStats && (
          <div className="stats-panel">
            <div className="stat-card">
              <span className="stat-label">Total Games</span>
              <span className="stat-value">{playerStats.totalGames}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Wins</span>
              <span className="stat-value wins">{playerStats.wins}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Losses</span>
              <span className="stat-value losses">{playerStats.losses}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">
                {playerStats.totalGames > 0 
                  ? ((playerStats.wins / playerStats.totalGames) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{playerStats.currentStreak} 🔥</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Net Profit</span>
              <span className="stat-value">
                {(parseFloat(playerStats.totalWon) - parseFloat(playerStats.totalWagered)).toFixed(4)} MON
              </span>
            </div>
          </div>
        )}

        <div className="game-board">
          {gameState && gameState.isActive ? (
            <>
              <div className="dealer-section">
                <h3 className="section-title">Dealer's Hand</h3>
                <div className="hand">
                  {gameState.dealerHand.map((card: any, index: number) => (
                    <Card 
                      key={index} 
                      card={card} 
                      hidden={!gameState.dealerTurn && index === 0}
                    />
                  ))}
                </div>
                {gameState.dealerTurn && (
                  <div className="hand-value">
                    Value: {calculateHandValue(gameState.dealerHand)}
                  </div>
                )}
              </div>

              <div className="player-section">
                <h3 className="section-title">Your Hand</h3>
                <div className="hand">
                  {gameState.playerHand.map((card: any, index: number) => (
                    <Card key={index} card={card} />
                  ))}
                </div>
                <div className="hand-value">
                  Value: {calculateHandValue(gameState.playerHand)}
                </div>
              </div>

              <div className="game-info">
                <div className="bet-info">
                  Current Bet: {gameState.bet} MON
                </div>
                {gameState.gameStatus > 0 && (
                  <div className={`game-result ${
                    gameState.gameStatus === 1 ? 'win' : 
                    gameState.gameStatus === 2 ? 'lose' : 'push'
                  }`}>
                    {gameState.gameStatus === 1 ? '🎉 You Win!' :
                     gameState.gameStatus === 2 ? '😔 Dealer Wins' :
                     '🤝 Push!'}
                  </div>
                )}
              </div>

              {!gameState.dealerTurn && gameState.gameStatus === 0 && (
                <div className="action-buttons">
                  <button 
                    onClick={playerHit} 
                    disabled={isLoading}
                    className="btn-action btn-hit"
                  >
                    Hit
                  </button>
                  <button 
                    onClick={playerStand} 
                    disabled={isLoading}
                    className="btn-action btn-stand"
                  >
                    Stand
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="start-game-section">
              <h2>Ready to Play?</h2>
              <div className="bet-controls">
                <label>Bet Amount (MON):</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.001"
                  max="1"
                  step="0.001"
                  className="bet-input"
                />
              </div>
              <button 
                onClick={startNewGame} 
                disabled={isLoading}
                className="btn-start"
              >
                Start New Game
              </button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner"></div>
              <p>Processing transaction...</p>
              {txHash && (
                <p className="tx-hash">TX: {txHash.slice(0, 10)}...</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App with routing
const AppContent: React.FC = () => {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      setWalletAddress(wallets[0].address);
    }
  }, [ready, authenticated, wallets]);

  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing...</p>
      </div>
    );
  }

  if (!authenticated || !walletAddress) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <h1>🎰 Monad Blackjack</h1>
          <p>Connect your wallet to play</p>
          <button onClick={() => window.location.reload()} className="connect-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navigation-bar">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              🎰 Monad Blackjack
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                🎮 Play Game
              </Link>
              <Link to="/leaderboard" className="nav-link">
                🏆 Leaderboard
              </Link>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<BlackjackGame walletAddress={walletAddress} />} />
          <Route path="/leaderboard" element={<GlobalLeaderboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PrivyProvider
        appId="cmejls4mk003kl20cahjpjgj5"
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#667eea'
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets'
          }
        }}
      >
        <AppContent />
      </PrivyProvider>
    </Provider>
  );
}

export default App;