import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.simple.css';

// Demo Game Component
const BlackjackGame: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'playerWin' | 'dealerWin' | 'push'>('idle');
  const [playerCards, setPlayerCards] = useState<Array<{suit: string, value: string}>>([]);
  const [dealerCards, setDealerCards] = useState<Array<{suit: string, value: string}>>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [bet, setBet] = useState('0.01');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, pushes: 0 });

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

  const startGame = () => {
    const newPlayerCards = [getRandomCard(), getRandomCard()];
    const newDealerCards = [getRandomCard(), getRandomCard()];
    
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
    setPlayerScore(calculateScore(newPlayerCards));
    setDealerScore(calculateScore([newDealerCards[0]]));
    setGameState('playing');
    setShowDealerCard(false);
  };

  const hit = () => {
    const newCards = [...playerCards, getRandomCard()];
    setPlayerCards(newCards);
    const newScore = calculateScore(newCards);
    setPlayerScore(newScore);
    
    if (newScore > 21) {
      endGame('dealerWin');
    }
  };

  const stand = () => {
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
  };

  const endGame = (result: 'playerWin' | 'dealerWin' | 'push') => {
    setGameState(result);
    setShowDealerCard(true);
    setDealerScore(calculateScore(dealerCards));
    
    if (result === 'playerWin') {
      setStats({...stats, wins: stats.wins + 1});
    } else if (result === 'dealerWin') {
      setStats({...stats, losses: stats.losses + 1});
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
      color: hidden ? 'transparent' : (card.suit === '♥️' || card.suit === '♦️') ? '#dc2626' : '#374151'
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
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '36px', color: '#ffd700' }}>🎴 Monad Blackjack</h1>
        <p style={{ color: '#94a3b8' }}>Demo Mode - Contract Not Deployed</p>
      </header>

      {/* Stats Bar */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 20px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <div>🏆 Wins: {stats.wins}</div>
        <div>💔 Losses: {stats.losses}</div>
        <div>🤝 Pushes: {stats.pushes}</div>
        <div>📊 Win Rate: {stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : 0}%</div>
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
        {/* Dealer Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>🎭 Dealer {showDealerCard && `(${calculateScore(dealerCards)})`}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '120px' }}>
            {dealerCards.map((card, index) => (
              <Card key={index} card={card} hidden={!showDealerCard && index === 1} />
            ))}
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
          {gameState === 'idle' && <span>Ready to play!</span>}
          {gameState === 'playing' && <span style={{color: '#ffd700'}}>Your turn</span>}
          {gameState === 'playerWin' && <span style={{color: '#10b981'}}>🎉 You Win!</span>}
          {gameState === 'dealerWin' && <span style={{color: '#ef4444'}}>😔 Dealer Wins</span>}
          {gameState === 'push' && <span style={{color: '#f59e0b'}}>🤝 Push!</span>}
        </div>

        {/* Player Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '16px' }}>👤 You ({playerScore})</h3>
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '120px' }}>
            {playerCards.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {gameState === 'idle' && (
            <>
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
                  marginRight: '8px'
                }}
                placeholder="Bet amount"
                min="0.001"
                max="1"
                step="0.001"
              />
              <button
                onClick={startGame}
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
                🎮 Start Game
              </button>
            </>
          )}
          
          {gameState === 'playing' && (
            <>
              <button
                onClick={hit}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🃏 Hit
              </button>
              <button
                onClick={stand}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
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
      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>
        <p>🎮 Demo Mode - Full blockchain version requires contract deployment</p>
        <p>⛓️ Ready for Monad testnet integration</p>
      </footer>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BlackjackGame />
    </Provider>
  );
};

export default App;