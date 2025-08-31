import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadGameState, hideResult } from '../store/gameSlice';
import Hand from './Hand';
import GameControls from './GameControls';
import { GameResult } from '../types/game';

interface GameBoardProps {
  walletAddress: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ walletAddress }) => {
  const dispatch = useAppDispatch();
  const { gameState, ui } = useAppSelector(state => state.game);

  // Load game state on component mount and wallet change
  useEffect(() => {
    if (walletAddress) {
      dispatch(loadGameState(walletAddress));
    }
  }, [dispatch, walletAddress]);

  const handleHideResult = () => {
    dispatch(hideResult());
  };

  const getResultModalContent = () => {
    if (!gameState || !ui.showResult) return null;

    const getResultTitle = () => {
      switch (gameState.gameStatus) {
        case GameResult.PLAYER_WIN:
          return '🎉 You Win!';
        case GameResult.DEALER_WIN:
          return '😔 Dealer Wins';
        case GameResult.PUSH:
          return '🤝 Push';
        default:
          return 'Game Over';
      }
    };

    const getResultClass = () => {
      switch (gameState.gameStatus) {
        case GameResult.PLAYER_WIN:
          return 'result-win';
        case GameResult.DEALER_WIN:
          return 'result-lose';
        case GameResult.PUSH:
          return 'result-push';
        default:
          return '';
      }
    };

    return (
      <div className={`game-result-modal ${getResultClass()}`}>
        <div className="result-content">
          <h2 className="result-title">{getResultTitle()}</h2>
          <p className="result-message">{ui.resultMessage}</p>
          
          <div className="result-details">
            <div className="final-hands">
              <div className="final-hand">
                <span>Your Hand: {ui.playerHandValue}</span>
                {ui.playerHandValue === 21 && gameState.playerCards.length === 2 && (
                  <span className="blackjack-indicator">🎯 BLACKJACK!</span>
                )}
                {ui.playerHandValue > 21 && (
                  <span className="bust-indicator">💥 BUST</span>
                )}
              </div>
              <div className="final-hand">
                <span>Dealer Hand: {ui.dealerHandValue}</span>
                {ui.dealerHandValue > 21 && (
                  <span className="bust-indicator">💥 BUST</span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={handleHideResult}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="game-board">
      {/* Game Result Modal */}
      {ui.showResult && getResultModalContent()}
      
      {/* Dealer Hand */}
      <div className="dealer-section">
        <Hand
          cards={gameState?.dealerCards || []}
          title="🎭 Dealer"
          hideFirstCard={ui.dealerHideCard}
          className="dealer-hand"
        />
      </div>
      
      {/* Game Status Bar */}
      <div className="game-status">
        {gameState?.isActive && !gameState.dealerTurn && (
          <div className="player-turn">
            <span className="turn-indicator">🎯 Your turn</span>
            {ui.playerHandValue <= 21 && (
              <div className="hand-advice">
                {ui.playerHandValue < 17 && <span className="advice-hit">Consider hitting</span>}
                {ui.playerHandValue >= 17 && ui.playerHandValue <= 20 && (
                  <span className="advice-stand">Consider standing</span>
                )}
              </div>
            )}
          </div>
        )}
        
        {gameState?.dealerTurn && (
          <div className="dealer-turn">
            <span className="turn-indicator">🎭 Dealer's turn</span>
            <div className="dealer-rules">
              <small>Dealer hits on 16, stands on 17</small>
            </div>
          </div>
        )}
        
        {!gameState?.isActive && gameState && (
          <div className="game-over">
            <span>Game Over - Game #{gameState.gameId}</span>
          </div>
        )}
      </div>
      
      {/* Player Hand */}
      <div className="player-section">
        <Hand
          cards={gameState?.playerCards || []}
          title="👤 You"
          className="player-hand"
        />
      </div>
      
      {/* Game Controls */}
      <div className="controls-section">
        <GameControls walletAddress={walletAddress} />
      </div>
      
      {/* Error Display */}
      {ui.error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{ui.error}</span>
          <button 
            className="error-dismiss"
            onClick={() => dispatch({ type: 'game/clearError' })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;