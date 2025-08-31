import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { startNewGame, hitCard, stand, doubleDown, forfeitGame } from '../store/gameSlice';

interface GameControlsProps {
  walletAddress: string;
}

const GameControls: React.FC<GameControlsProps> = ({ walletAddress }) => {
  const dispatch = useAppDispatch();
  const { gameState, ui } = useAppSelector(state => state.game);
  const [betAmount, setBetAmount] = useState('0.01');
  const [showBetInput, setShowBetInput] = useState(!gameState?.isActive);

  const handleStartGame = async () => {
    if (parseFloat(betAmount) < 0.001 || parseFloat(betAmount) > 1) {
      alert('Bet amount must be between 0.001 and 1 MON');
      return;
    }
    
    await dispatch(startNewGame(betAmount));
    setShowBetInput(false);
  };

  const handleHit = () => {
    dispatch(hitCard());
  };

  const handleStand = () => {
    dispatch(stand());
  };

  const handleDoubleDown = () => {
    if (gameState) {
      dispatch(doubleDown(gameState.bet));
    }
  };

  const handleForfeit = () => {
    if (window.confirm('Are you sure you want to forfeit this game? You will lose your bet.')) {
      dispatch(forfeitGame());
    }
  };

  const handleNewGame = () => {
    setShowBetInput(true);
  };

  if (ui.isLoading) {
    return (
      <div className="game-controls loading">
        <div className="loading-spinner">⏳</div>
        <p>Processing transaction...</p>
      </div>
    );
  }

  if (ui.error) {
    return (
      <div className="game-controls error">
        <div className="error-message">
          <span>❌ {ui.error}</span>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gameState?.isActive && showBetInput) {
    return (
      <div className="game-controls bet-section">
        <h3>Place Your Bet</h3>
        <div className="bet-input-container">
          <div className="bet-input-group">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="0.001"
              max="1"
              step="0.001"
              className="bet-input"
              placeholder="0.001 - 1 MON"
            />
            <span className="currency">MON</span>
          </div>
          
          <div className="quick-bet-buttons">
            <button onClick={() => setBetAmount('0.001')} className="quick-bet">Min</button>
            <button onClick={() => setBetAmount('0.01')} className="quick-bet">0.01</button>
            <button onClick={() => setBetAmount('0.1')} className="quick-bet">0.1</button>
            <button onClick={() => setBetAmount('1')} className="quick-bet">Max</button>
          </div>
        </div>
        
        <button 
          className="btn btn-primary start-game-btn"
          onClick={handleStartGame}
          disabled={!betAmount || parseFloat(betAmount) < 0.001 || parseFloat(betAmount) > 1}
        >
          🎮 Start Game ({betAmount} MON)
        </button>
      </div>
    );
  }

  if (!gameState?.isActive) {
    return (
      <div className="game-controls new-game">
        <button 
          className="btn btn-primary"
          onClick={handleNewGame}
        >
          🎯 New Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-controls active-game">
      <div className="game-info">
        <div className="current-bet">
          Bet: {gameState.bet} MON
        </div>
        <div className="game-id">
          Game #{gameState.gameId}
        </div>
      </div>

      <div className="action-buttons">
        {ui.canHit && (
          <button 
            className="btn btn-action hit-btn"
            onClick={handleHit}
            disabled={ui.isLoading}
          >
            🃏 Hit
          </button>
        )}
        
        {ui.canStand && (
          <button 
            className="btn btn-action stand-btn"
            onClick={handleStand}
            disabled={ui.isLoading}
          >
            ✋ Stand
          </button>
        )}
        
        {ui.canDoubleDown && (
          <button 
            className="btn btn-action double-btn"
            onClick={handleDoubleDown}
            disabled={ui.isLoading}
          >
            💎 Double Down
          </button>
        )}
      </div>

      <div className="secondary-actions">
        <button 
          className="btn btn-secondary forfeit-btn"
          onClick={handleForfeit}
          disabled={ui.isLoading}
        >
          🏳️ Forfeit
        </button>
      </div>

      {gameState.dealerTurn && (
        <div className="dealer-turn-indicator">
          <span className="dealer-playing">🎭 Dealer is playing...</span>
        </div>
      )}
    </div>
  );
};

export default GameControls;