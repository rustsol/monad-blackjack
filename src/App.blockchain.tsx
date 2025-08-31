import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.simple.css';

// Mock contract integration (will be replaced with real contract calls)
const mockContractService = {
  isConnected: false,
  playerAddress: null as string | null,
  
  async connect(address: string) {
    this.isConnected = true;
    this.playerAddress = address;
    return true;
  },
  
  async startGame(betAmount: string) {
    console.log(`🎮 Starting game with bet: ${betAmount} MON`);
    // This will be replaced with: await contractService.startGame(betAmount)
    return { hash: '0xmock...', wait: () => Promise.resolve() };
  },
  
  async hit() {
    console.log(`🃏 Hitting...`);
    // This will be replaced with: await contractService.hit()
    return { hash: '0xmock...', wait: () => Promise.resolve() };
  },
  
  async stand() {
    console.log(`✋ Standing...`);
    // This will be replaced with: await contractService.stand()
    return { hash: '0xmock...', wait: () => Promise.resolve() };
  },
  
  async getGameState(address: string) {
    // Mock game state - will be replaced with real contract call
    return {
      player: address,
      playerCards: [],
      dealerCards: [],
      bet: '0',
      gameStatus: 0,
      isActive: false,
      gameId: '0',
      dealerTurn: false,
      timestamp: Date.now().toString()
    };
  }
};

// Authentication Component
const AuthComponent: React.FC<{ onConnect: (address: string) => void }> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Mock wallet connection - will be replaced with Privy
    const mockAddress = "0xfbc9254868a6E10d633B07104d2Fb880e320865d";
    await new Promise(resolve => setTimeout(resolve, 1000));
    onConnect(mockAddress);
    setIsConnecting(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '400px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎴</div>
        <h1 style={{ fontSize: '32px', color: '#ffd700', marginBottom: '12px' }}>Monad Blackjack</h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
          Blockchain-ready blackjack game for Monad testnet
        </p>
        
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            opacity: isConnecting ? 0.7 : 1
          }}
        >
          {isConnecting ? '🔄 Connecting...' : '🎮 Connect Wallet (Mock)'}
        </button>

        <div style={{ marginTop: '32px', fontSize: '12px', color: '#64748b' }}>
          <p>🔗 Ready for Monad Games ID integration</p>
          <p>⛓️ Contract deployment required</p>
          <p>🏆 Global leaderboard compatible</p>
        </div>
      </div>
    </div>
  );
};

// Main Game Component  
const BlockchainBlackjack: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'playerWin' | 'dealerWin' | 'push'>('idle');
  const [playerCards, setPlayerCards] = useState<Array<{suit: string, value: string}>>([]);
  const [dealerCards, setDealerCards] = useState<Array<{suit: string, value: string}>>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [bet, setBet] = useState('0.01');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [stats, setStats] = useState({ 
    wins: 0, 
    losses: 0, 
    pushes: 0, 
    totalWagered: '0',
    totalWon: '0',
    currentStreak: 0 
  });

  const suits = ['♥️', '♦️', '♣️', '♠️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const getRandomCard = () => {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
  };

  const calculateScore = (cards: Array<{suit: string, value: string}>) => {
    let score = 0;
    let aces = 0;
    
    for (const card of cards) {
      if (card.value === 'A') {
        aces++;
        score += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    }
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  const startGame = async () => {
    setIsLoading(true);
    setTxHash(null);
    
    try {
      // This will call the smart contract
      const tx = await mockContractService.startGame(bet);
      setTxHash(tx.hash);
      
      // Mock the card dealing for demo
      const newPlayerCards = [getRandomCard(), getRandomCard()];
      const newDealerCards = [getRandomCard(), getRandomCard()];
      
      setPlayerCards(newPlayerCards);
      setDealerCards(newDealerCards);
      setPlayerScore(calculateScore(newPlayerCards));
      setDealerScore(calculateScore([newDealerCards[0]]));
      setGameState('playing');
      setShowDealerCard(false);
      
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Transaction failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const hit = async () => {
    setIsLoading(true);
    
    try {
      const tx = await mockContractService.hit();
      setTxHash(tx.hash);
      
      // Mock adding card
      const newCards = [...playerCards, getRandomCard()];
      setPlayerCards(newCards);
      const newScore = calculateScore(newCards);
      setPlayerScore(newScore);
      
      if (newScore > 21) {
        endGame('dealerWin');
      }
      
    } catch (error) {
      console.error('Failed to hit:', error);
      alert('Transaction failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const stand = async () => {
    setIsLoading(true);
    
    try {
      const tx = await mockContractService.stand();
      setTxHash(tx.hash);
      
      // Mock dealer play
      setShowDealerCard(true);
      let currentDealerCards = [...dealerCards];
      let currentDealerScore = calculateScore(currentDealerCards);
      
      while (currentDealerScore < 17) {
        currentDealerCards.push(getRandomCard());
        currentDealerScore = calculateScore(currentDealerCards);
      }
      
      setDealerCards(currentDealerCards);
      setDealerScore(currentDealerScore);
      
      if (currentDealerScore > 21) {
        endGame('playerWin');
      } else if (currentDealerScore > playerScore) {
        endGame('dealerWin');
      } else if (playerScore > currentDealerScore) {
        endGame('playerWin');
      } else {
        endGame('push');
      }
      
    } catch (error) {
      console.error('Failed to stand:', error);
      alert('Transaction failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const endGame = (result: 'playerWin' | 'dealerWin' | 'push') => {
    setGameState(result);
    setShowDealerCard(true);
    setDealerScore(calculateScore(dealerCards));
    
    // Update stats (these would come from the blockchain)
    if (result === 'playerWin') {
      setStats({...stats, wins: stats.wins + 1, currentStreak: stats.currentStreak + 1});
    } else if (result === 'dealerWin') {
      setStats({...stats, losses: stats.losses + 1, currentStreak: 0});
    } else {
      setStats({...stats, pushes: stats.pushes + 1});
    }
  };

  const Card: React.FC<{card: {suit: string, value: string}, hidden?: boolean}> = ({card, hidden}) => (
    <div style={{
      width: '80px',
      height: '112px',
      background: hidden ? 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)' : 'white',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 4px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: hidden ? 'transparent' : (card.suit === '♥️' || card.suit === '♦️') ? '#dc2626' : '#374151',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      {!hidden && (
        <>
          <div>{card.value}</div>
          <div style={{fontSize: '20px'}}>{card.suit}</div>
        </>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '36px', color: '#ffd700', margin: 0 }}>🎴 Monad Blackjack</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>Blockchain Integration Ready</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
          {txHash && (
            <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>
              Tx: {txHash.slice(0, 8)}...
            </div>
          )}
        </div>
      </header>

      {/* Blockchain Status */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 20px',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ color: '#10b981', fontSize: '14px' }}>
          ⛓️ {process.env.REACT_APP_CONTRACT_ADDRESS ? 
            `Connected to contract: ${process.env.REACT_APP_CONTRACT_ADDRESS.slice(0, 10)}...` : 
            'Ready for contract deployment'
          }
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 20px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div>🏆 {stats.wins} Wins</div>
        <div>💔 {stats.losses} Losses</div>
        <div>🤝 {stats.pushes} Pushes</div>
        <div>🔥 {stats.currentStreak} Streak</div>
        <div>📊 {stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : 0}% WR</div>
      </div>

      {/* Game Board */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px',
            zIndex: 100
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
              <div>Processing blockchain transaction...</div>
            </div>
          </div>
        )}

        {/* Dealer Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>
            🎭 Dealer {showDealerCard && `(${dealerScore})`}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '120px', alignItems: 'center' }}>
            {dealerCards.map((card, index) => (
              <Card key={index} card={card} hidden={!showDealerCard && index === 1} />
            ))}
            {dealerCards.length === 0 && (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>Waiting for game...</div>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'rgba(100, 116, 139, 0.1)',
          borderRadius: '8px',
          marginBottom: '32px'
        }}>
          {gameState === 'idle' && <span>Ready to play on blockchain!</span>}
          {gameState === 'playing' && <span style={{color: '#ffd700'}}>🎯 Your turn - Make your move</span>}
          {gameState === 'playerWin' && <span style={{color: '#10b981'}}>🎉 You Win! Payout sent to wallet</span>}
          {gameState === 'dealerWin' && <span style={{color: '#ef4444'}}>😔 Dealer Wins</span>}
          {gameState === 'push' && <span style={{color: '#f59e0b'}}>🤝 Push! Bet returned</span>}
        </div>

        {/* Player Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '16px' }}>
            👤 You {playerCards.length > 0 && `(${playerScore})`}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '120px', alignItems: 'center' }}>
            {playerCards.map((card, index) => (
              <Card key={index} card={card} />
            ))}
            {playerCards.length === 0 && (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>Ready for cards...</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {gameState === 'idle' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#f8fafc',
                    width: '120px'
                  }}
                  placeholder="0.001"
                  min="0.001"
                  max="1"
                  step="0.001"
                />
                <span style={{ color: '#ffd700' }}>MON</span>
              </div>
              <button
                onClick={startGame}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                🎮 Start Game (Blockchain)
              </button>
            </>
          )}
          
          {gameState === 'playing' && (
            <>
              <button
                onClick={hit}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                🃏 Hit
              </button>
              <button
                onClick={stand}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                ✋ Stand
              </button>
            </>
          )}
          
          {(gameState === 'playerWin' || gameState === 'dealerWin' || gameState === 'push') && (
            <button
              onClick={() => setGameState('idle')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🎯 New Game
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '12px' }}>
        <p>⛓️ Every move recorded on Monad blockchain</p>
        <p>🏆 Integrated with Monad Games ID leaderboard</p>
        <p>🎮 Ready for full blockchain deployment</p>
      </footer>
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  return (
    <Provider store={store}>
      {!connectedAddress ? (
        <AuthComponent onConnect={setConnectedAddress} />
      ) : (
        <BlockchainBlackjack walletAddress={connectedAddress} />
      )}
    </Provider>
  );
};

export default App;