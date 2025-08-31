import React, { useEffect, useState, useCallback } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { useDispatch, useSelector } from 'react-redux';
import { store, RootState, useAppDispatch, useAppSelector } from './store';
import { contractService } from './utils/contractService';
import { soundManager } from './utils/soundManager';
import { ethers } from 'ethers';
import GlobalLeaderboard from './components/GlobalLeaderboard';
import {
  playCardDealSound,
  playCardFlipSound,
  playChipPlaceSound,
  playWinSound,
  playLoseSound,
  playTransactionSound,
  startAmbientSound,
  stopAmbientSound,
  setSoundEnabled,
  setMasterVolume,
  dealCardsSequence,
  triggerWinCelebration,
  triggerBustEffect,
  resetCasinoEffects
} from './store/casinoSlice';
import './casino-blackjack.css';
import './styles/leaderboard.css';
import './styles/navigation.css';

// Fix ethereum provider type for ethers - type already declared globally

// Premium Casino Card Component with animations
const CasinoCard: React.FC<{
  card: {suit: number, value: number}, 
  hidden?: boolean, 
  animationDelay?: number,
  glowEffect?: boolean
}> = ({card, hidden, animationDelay = 0, glowEffect = false}) => {
  // Match contract suit order: 0=Hearts, 1=Diamonds, 2=Clubs, 3=Spades
  const suits = ['♥️', '♦️', '♣️', '♠️'];
  const values = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (animationDelay > 0) {
      setTimeout(() => {
        setIsAnimating(true);
      }, animationDelay);
    } else {
      setIsAnimating(true);
    }
  }, [animationDelay]);
  
  if (hidden) {
    return (
      <div className={`playing-card card-hidden ${isAnimating ? 'card-deal-animation' : ''}`}>
        <div className="card-back-pattern">🎴</div>
      </div>
    );
  }
  
  return (
    <div className={`playing-card ${card.suit <= 1 ? 'red' : 'black'} ${
      isAnimating ? 'card-deal-animation' : ''
    } ${glowEffect ? 'card-glow' : ''}`}>
      <div className="card-value">{values[card.value]}</div>
      <div className="card-suit">{suits[card.suit]}</div>
    </div>
  );
};

// Sound Control Panel Component
const SoundControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { soundEnabled, masterVolume, ambientPlaying } = useAppSelector(state => state.casino);

  const toggleSound = () => {
    dispatch(setSoundEnabled(!soundEnabled));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    dispatch(setMasterVolume(volume));
  };

  const toggleAmbient = () => {
    if (ambientPlaying) {
      dispatch(stopAmbientSound());
    } else {
      dispatch(startAmbientSound());
    }
  };

  const testSound = () => {
    console.log('🎵 Testing card deal sound...');
    soundManager.playCardDeal();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '1rem',
      borderRadius: '10px',
      border: '2px solid var(--gold)',
      color: 'var(--gold)',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={toggleSound}
          style={{
            background: soundEnabled ? 'var(--gold)' : 'transparent',
            color: soundEnabled ? 'var(--dark-green)' : 'var(--gold)',
            border: '1px solid var(--gold)',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button 
          onClick={toggleAmbient}
          disabled={!soundEnabled}
          style={{
            background: ambientPlaying ? 'var(--gold)' : 'transparent',
            color: ambientPlaying ? 'var(--dark-green)' : 'var(--gold)',
            border: '1px solid var(--gold)',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: soundEnabled ? 'pointer' : 'not-allowed',
            opacity: soundEnabled ? 1 : 0.5,
            marginRight: '10px'
          }}
        >
          🎵
        </button>
        <button 
          onClick={testSound}
          disabled={!soundEnabled}
          style={{
            background: 'transparent',
            color: 'var(--gold)',
            border: '1px solid var(--gold)',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: soundEnabled ? 'pointer' : 'not-allowed',
            opacity: soundEnabled ? 1 : 0.5
          }}
        >
          🔊 Test
        </button>
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>
          Volume: {Math.round(masterVolume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={masterVolume}
          onChange={handleVolumeChange}
          disabled={!soundEnabled}
          style={{
            width: '100px',
            opacity: soundEnabled ? 1 : 0.5
          }}
        />
      </div>
    </div>
  );
};

// Main Casino Blackjack Game Component
const CasinoBlackjackGame: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const dispatch = useAppDispatch();
  const casinoState = useAppSelector(state => state.casino);
  const { wallets } = useWallets();
  
  const [gameState, setGameState] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [betAmount, setBetAmount] = useState('0.01');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract and start ambient sound
  useEffect(() => {
    const initContract = async () => {
      try {
        console.log('🎰 Initializing casino contract for wallet:', walletAddress);
        
        // Add delay to ensure Privy wallet is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get provider and signer from window.ethereum (Privy provides this)
        if (window.ethereum) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();
            
            console.log('🔗 Got signer address:', signerAddress);
            
            if (signerAddress.toLowerCase() === walletAddress.toLowerCase()) {
              await contractService.initialize(signer);
              console.log('🔗 Casino contract initialized:', contractService.getContractAddress());
              
              // Load initial game state
              await loadGameData();
              
              // Start ambient casino sounds
              if (casinoState.soundEnabled) {
                dispatch(startAmbientSound());
              }
            } else {
              console.warn('🚨 Signer address does not match wallet address');
              setError('Wallet address mismatch. Please reconnect your wallet.');
            }
          } catch (signerError: any) {
            if (signerError.code === 'ACTION_REJECTED' || signerError.code === -32002) {
              console.log('🔗 User declined wallet connection, using read-only mode');
              // Initialize without signer for read-only mode
              const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
              await contractService.initializeReadOnly(provider);
              await loadGameData();
            } else {
              throw signerError;
            }
          }
        } else {
          console.warn('🚨 No ethereum provider found');
          setError('No wallet provider found. Please ensure your wallet is connected.');
        }
      } catch (error) {
        console.error('Failed to initialize casino contract:', error);
        setError('Failed to connect to blockchain contract. Please refresh and try again.');
      }
    };

    if (walletAddress) {
      initContract();
    }

    // Cleanup ambient sound on unmount
    return () => {
      dispatch(stopAmbientSound());
    };
  }, [walletAddress, dispatch, casinoState.soundEnabled]);

  const loadGameData = async () => {
    try {
      const [gameState, playerStats] = await Promise.all([
        contractService.getGameState(walletAddress),
        contractService.getPlayerStats(walletAddress)
      ]);
      setGameState(gameState);
      setPlayerStats(playerStats);
    } catch (error) {
      console.error('Failed to load casino game data:', error);
    }
  };

  const playButtonSound = useCallback(() => {
    if (casinoState.buttonHoverSounds) {
      soundManager.playButtonClick();
    }
  }, [casinoState.buttonHoverSounds]);

  const startGame = async () => {
    setIsLoading(true);
    setError(null);
    dispatch(resetCasinoEffects());
    
    try {
      console.log(`🎰 Starting casino game with bet: ${betAmount} MON`);
      
      // Play chip placement sound
      dispatch(playChipPlaceSound(betAmount));
      
      const txResponse = await contractService.startGame(betAmount);
      setTxHash(txResponse.hash);
      
      // Play transaction sound
      dispatch(playTransactionSound());
      
      console.log(`📤 Casino transaction: ${txResponse.hash}`);
      await txResponse.wait();
      
      console.log('✅ Casino game started on blockchain!');
      
      // Load game data and trigger card dealing animation
      await loadGameData();
      
      // Trigger card dealing sequence with sound
      const newGameState = await contractService.getGameState(walletAddress);
      if (newGameState.playerCards && newGameState.playerCards.length > 0) {
        dispatch(dealCardsSequence({
          cards: [...newGameState.playerCards, ...newGameState.dealerCards],
          isPlayer: true
        }));
        
        // Play card dealing sounds with delays
        newGameState.playerCards.forEach((_, index) => {
          setTimeout(() => {
            dispatch(playCardDealSound());
          }, index * 300);
        });
        
        newGameState.dealerCards.forEach((_, index) => {
          setTimeout(() => {
            dispatch(playCardDealSound());
          }, (newGameState.playerCards.length + index) * 300);
        });
      }
      
    } catch (error: any) {
      console.error('Failed to start casino game:', error);
      setError(`Transaction failed: ${error.message}`);
      dispatch(playLoseSound(false));
    }
    
    setIsLoading(false);
  };

  const hit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🃏 Hitting in casino...');
      
      const txResponse = await contractService.hit();
      setTxHash(txResponse.hash);
      
      // Play card flip sound
      dispatch(playCardFlipSound());
      dispatch(playTransactionSound());
      
      console.log(`📤 Hit transaction: ${txResponse.hash}`);
      await txResponse.wait();
      
      console.log('✅ Hit executed in casino!');
      await loadGameData();
      
      // Check if player busted
      const newGameState = await contractService.getGameState(walletAddress);
      if (newGameState.playerCards && calculateHandValue(newGameState.playerCards) > 21) {
        dispatch(triggerBustEffect());
        dispatch(playLoseSound(true));
      } else {
        dispatch(playCardDealSound());
      }
      
    } catch (error: any) {
      console.error('Failed to hit in casino:', error);
      setError(`Transaction failed: ${error.message}`);
      dispatch(playLoseSound(false));
    }
    
    setIsLoading(false);
  };

  const stand = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('✋ Standing in casino...');
      
      // Check current game state before attempting to stand
      const currentGameState = await contractService.getGameState(walletAddress);
      console.log('🎯 Current game state before stand:', {
        isActive: currentGameState.isActive,
        dealerTurn: currentGameState.dealerTurn,
        gameStatus: currentGameState.gameStatus,
        playerCards: currentGameState.playerCards,
        dealerCards: currentGameState.dealerCards,
        bet: currentGameState.bet,
        gameId: currentGameState.gameId
      });
      
      if (!currentGameState.isActive) {
        throw new Error(`No active game found. Game Status: ${currentGameState.gameStatus}, isActive: ${currentGameState.isActive}`);
      }
      
      if (currentGameState.dealerTurn) {
        throw new Error(`It's the dealer's turn. dealerTurn: ${currentGameState.dealerTurn}`);
      }
      
      if (!currentGameState.playerCards || currentGameState.playerCards.length === 0) {
        throw new Error(`No player cards found. Cards length: ${currentGameState.playerCards?.length}`);
      }
      
      const playerValue = calculateHandValue(currentGameState.playerCards);
      if (playerValue > 21) {
        throw new Error(`You have already busted. Player value: ${playerValue}`);
      }
      
      console.log('🎯 All checks passed, game state is valid for stand()');
      
      console.log('🎯 Game state valid, executing stand...');
      
      const txResponse = await contractService.stand();
      setTxHash(txResponse.hash);
      
      dispatch(playTransactionSound());
      
      console.log(`📤 Stand transaction: ${txResponse.hash}`);
      const receipt = await txResponse.wait();
      console.log('📋 Transaction receipt:', receipt);
      
      console.log('✅ Stand executed in casino!');
      await loadGameData();
      
      // Check game result and play appropriate sound
      const newGameState = await contractService.getGameState(walletAddress);
      console.log('🎯 Final game state after stand:', newGameState);
      
      if (newGameState.gameStatus === 1) {
        // Player won
        const isBlackjack = newGameState.playerCards?.length === 2 && 
                           calculateHandValue(newGameState.playerCards) === 21;
        dispatch(playWinSound(isBlackjack));
        dispatch(triggerWinCelebration({
          isBlackjack,
          payout: newGameState.bet
        }));
      } else if (newGameState.gameStatus === 2) {
        // Player lost
        dispatch(playLoseSound(false));
      } else if (newGameState.gameStatus === 3) {
        // Push
        soundManager.playPush();
      }
      
    } catch (error: any) {
      console.error('Failed to stand in casino:', error);
      console.error('Error details:', {
        code: error.code,
        reason: error.reason,
        message: error.message,
        data: error.data
      });
      setError(`Transaction failed: ${error.shortMessage || error.message}`);
      dispatch(playLoseSound(false));
    }
    
    setIsLoading(false);
  };

  const doubleDown = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💰 Doubling down in casino...');
      
      // Play chip placement sound for additional bet
      dispatch(playChipPlaceSound(betAmount));
      
      const txResponse = await contractService.doubleDown(betAmount);
      setTxHash(txResponse.hash);
      
      dispatch(playTransactionSound());
      
      console.log(`📤 Double down transaction: ${txResponse.hash}`);
      await txResponse.wait();
      
      console.log('✅ Double down executed in casino!');
      await loadGameData();
      
      // Play card deal sound for the additional card
      dispatch(playCardDealSound());
      
    } catch (error: any) {
      console.error('Failed to double down in casino:', error);
      setError(`Transaction failed: ${error.message}`);
      dispatch(playLoseSound(false));
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
      case 1: return 'You Won!';
      case 2: return 'Dealer Won';
      case 3: return 'Push (Tie)';
      default: return 'Unknown';
    }
  };

  if (!contractService.isInitialized()) {
    return (
      <div className="casino-app">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}>
          <div className="loading-spinner">🎰</div>
          <h2 style={{ color: 'var(--gold)', marginTop: '1rem' }}>
            Connecting to Casino Blockchain...
          </h2>
          <p style={{ color: 'var(--ivory)', marginTop: '0.5rem' }}>
            Contract: {contractService.getContractAddress()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-app">
      <SoundControlPanel />
      
      {/* Casino Table */}
      <div className="casino-table">
        {/* Header with wallet info */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '20px',
          color: 'var(--gold)',
          fontSize: '0.9rem',
          textShadow: '2px 2px 4px var(--shadow-deep)'
        }}>
          👤 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          <div style={{ fontSize: '0.8rem', color: 'var(--ivory)', marginTop: '4px' }}>
            📝 Contract: {contractService.getContractAddress().slice(0, 10)}...
          </div>
        </div>

        {/* Dealer Area */}
        <div className="dealer-area">
          <div className="dealer-title">🎭 DEALER</div>
          <div className="dealer-cards-area">
            {gameState?.dealerCards && gameState.dealerCards.length > 0 && (
              <div className="dealer-hand-value">
                {calculateHandValue(gameState.dealerCards)}
              </div>
            )}
            <div className="card-container">
              {gameState?.dealerCards?.map((card: any, index: number) => (
                <CasinoCard 
                  key={index} 
                  card={card} 
                  hidden={!gameState.dealerTurn && index === 1}
                  animationDelay={index * 200}
                  glowEffect={casinoState.cardGlowEffect}
                />
              ))}
              {(!gameState?.dealerCards || gameState.dealerCards.length === 0) && (
                <div style={{ 
                  color: 'var(--ivory)', 
                  fontStyle: 'italic', 
                  opacity: 0.7,
                  fontSize: '1.1rem'
                }}>
                  Waiting for cards...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        {txHash && (
          <div className="blockchain-info">
            🔗 Transaction: <a 
              href={`https://testnet.monadexplorer.com/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="transaction-link"
            >
              {txHash.slice(0, 20)}...
            </a>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-display">
            ❌ {error}
          </div>
        )}

        {/* Player Stats Bar */}
        {playerStats && (
          <div className="player-stats-bar">
            <div className="stat-item">
              <span className="stat-label">Games</span>
              <span className="stat-value">{playerStats.totalGames}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Wins</span>
              <span className="stat-value">{playerStats.wins}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Losses</span>
              <span className="stat-value">{playerStats.losses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{playerStats.currentStreak}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Won</span>
              <span className="stat-value">{parseFloat(playerStats.totalWon).toFixed(4)} MON</span>
            </div>
          </div>
        )}

        {/* Game Status Display */}
        <div className="game-status-display">
          <div className={`status-message ${
            gameState?.isActive ? 'status-active' :
            gameState?.gameStatus === 1 ? 'status-win' :
            gameState?.gameStatus === 2 ? 'status-lose' :
            gameState?.gameStatus === 3 ? 'status-push' :
            'status-waiting'
          } ${casinoState.celebrationMode ? 'win-animation' : ''} ${casinoState.bustAnimation ? 'bust-animation' : ''}`}>
            {gameState?.isActive ? (
              <>
                🎯 {getGameStatusText(gameState.gameStatus)}
                {gameState?.playerCards && calculateHandValue(gameState?.playerCards) > 21 && (
                  <div style={{color: 'var(--casino-red)', marginTop: '0.5rem', fontSize: '1.2rem'}}>
                    💥 BUSTED!
                  </div>
                )}
              </>
            ) : gameState?.gameStatus !== undefined && gameState?.gameStatus !== 0 ? (
              <>
                🎯 {getGameStatusText(gameState.gameStatus)}
                <div style={{
                  marginTop: '0.5rem', 
                  fontSize: '1rem', 
                  color: 'var(--ivory)',
                  opacity: 0.8
                }}>
                  Ready for next hand
                </div>
              </>
            ) : (
              '🎰 Welcome to Casino Blackjack!'
            )}
          </div>
          
          {gameState?.bet && gameState.bet !== '0' && (
            <div className="current-bet-display">
              💰 Current Bet: {parseFloat(gameState.bet).toFixed(4)} MON
            </div>
          )}
        </div>

        {/* Player Area */}
        <div className="player-area">
          <div className="player-title">👤 YOU</div>
          <div className="player-cards-area">
            {gameState?.playerCards && gameState.playerCards.length > 0 && (
              <div className="player-hand-value">
                {calculateHandValue(gameState.playerCards)}
              </div>
            )}
            <div className="card-container">
              {gameState?.playerCards?.map((card: any, index: number) => (
                <CasinoCard 
                  key={index} 
                  card={card}
                  animationDelay={index * 200}
                  glowEffect={casinoState.cardGlowEffect}
                />
              ))}
              {(!gameState?.playerCards || gameState.playerCards.length === 0) && (
                <div style={{ 
                  color: 'var(--ivory)', 
                  fontStyle: 'italic', 
                  opacity: 0.7,
                  fontSize: '1.1rem'
                }}>
                  Ready for cards...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div style={{ marginTop: '2rem' }}>
          {!gameState?.isActive ? (
            <div className="betting-section">
              <div className="bet-input-container">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.001"
                  max="1"
                  step="0.001"
                  disabled={isLoading}
                  className="bet-input-field"
                  placeholder="0.001"
                />
                <span className="currency-label">MON</span>
              </div>
              <div className="action-buttons-container">
                <button
                  onClick={() => {
                    playButtonSound();
                    startGame();
                  }}
                  disabled={isLoading || !betAmount}
                  className={`casino-btn btn-start-game ${isLoading ? 'btn-loading' : ''}`}
                >
                  {isLoading ? '⏳ Dealing...' : '🎰 Deal Cards'}
                </button>
              </div>
            </div>
          ) : (
            <div className="action-buttons-container">
              <button
                onClick={() => {
                  playButtonSound();
                  hit();
                }}
                disabled={isLoading || gameState.dealerTurn || !gameState.isActive || 
                         (gameState.playerCards && calculateHandValue(gameState.playerCards) >= 21)}
                className={`casino-btn btn-hit ${isLoading ? 'btn-loading' : ''}`}
              >
                {isLoading ? '⏳' : '🃏 Hit'}
              </button>
              
              <button
                onClick={() => {
                  playButtonSound();
                  stand();
                }}
                disabled={isLoading || gameState.dealerTurn || !gameState.isActive || 
                         (gameState.playerCards && calculateHandValue(gameState.playerCards) >= 21)}
                className={`casino-btn btn-stand ${isLoading ? 'btn-loading' : ''}`}
              >
                {isLoading ? '⏳' : '✋ Stand'}
              </button>
              
              {gameState.playerCards?.length === 2 && (
                <button
                  onClick={() => {
                    playButtonSound();
                    doubleDown();
                  }}
                  disabled={isLoading || gameState.dealerTurn || !gameState.isActive || 
                           (gameState.playerCards && calculateHandValue(gameState.playerCards) >= 21)}
                  className={`casino-btn btn-double-down ${isLoading ? 'btn-loading' : ''}`}
                >
                  {isLoading ? '⏳' : '💎 Double'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">🎰</div>
              <div className="loading-text">Processing Casino Transaction...</div>
              <div className="loading-subtext">Every move is recorded on Monad blockchain</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        color: 'var(--ivory)',
        fontSize: '0.9rem',
        opacity: 0.8
      }}>
        <p>⛓️ Premium Casino Experience on Monad Blockchain</p>
        <p>🎮 Integrated with Monad Games ID for cross-game leaderboards</p>
        <p>🏆 Every hand is a real transaction - No simulation!</p>
      </div>
    </div>
  );
};

// Enhanced Authentication Screen
const CasinoAuthWrapper: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && user && wallets.length > 0) {
      const connectedWallet = wallets.find(wallet => wallet.address);
      if (connectedWallet) {
        setWalletAddress(connectedWallet.address);
        console.log('🎰 Casino wallet connected:', connectedWallet.address);
      }
    }
  }, [authenticated, user, wallets]);

  if (!ready) {
    return (
      <div className="auth-screen-casino">
        <div className="auth-container-casino">
          <div className="loading-spinner">🎰</div>
          <h2 style={{ color: 'var(--gold)', marginTop: '1rem' }}>
            Loading Casino...
          </h2>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="auth-screen-casino">
        <div className="auth-container-casino">
          <div className="auth-title-casino">🎰 CASINO BLACKJACK</div>
          <div className="auth-subtitle-casino">
            Premium blockchain gaming with Monad Games ID
          </div>
          <button onClick={login} className="connect-btn-casino">
            🎮 Enter Casino
          </button>
          <div style={{ 
            marginTop: '2rem', 
            fontSize: '0.9rem', 
            color: 'var(--ivory)',
            opacity: 0.8
          }}>
            <p>✨ Realistic casino experience</p>
            <p>🎵 Professional sound effects</p>
            <p>🎴 Smooth card animations</p>
            <p>⛓️ Real MON blockchain transactions</p>
          </div>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="auth-screen-casino">
        <div className="auth-container-casino">
          <div className="loading-spinner">🔗</div>
          <h2 style={{ color: 'var(--gold)', marginTop: '1rem' }}>
            Connecting to Casino Wallet...
          </h2>
          <button 
            onClick={logout} 
            style={{
              marginTop: '1rem',
              background: 'transparent',
              color: 'var(--ivory)',
              border: '1px solid var(--ivory)',
              borderRadius: '5px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            Logout
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
              <button
                onClick={logout}
                className="nav-link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🚪 Exit
              </button>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<CasinoBlackjackGame walletAddress={walletAddress} />} />
          <Route path="/leaderboard" element={<GlobalLeaderboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

// Main Casino App with Provider
const CasinoApp: React.FC = () => {
  const privyAppId = process.env.REACT_APP_PRIVY_APP_ID;
  
  if (!privyAppId) {
    return (
      <div className="auth-screen-casino">
        <div className="auth-container-casino">
          <h1>❌ Configuration Error</h1>
          <p>REACT_APP_PRIVY_APP_ID not set in .env file</p>
          <p>Current contract: {process.env.REACT_APP_CONTRACT_ADDRESS}</p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['wallet', 'email'],
          appearance: {
            theme: 'dark',
            accentColor: '#FFD700',
            logo: '🎰',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
            requireUserPasswordOnCreate: false,
          },
          externalWallets: {
            coinbaseWallet: {
              connectionOptions: 'eoaOnly'
            }
          },
        }}
      >
        <CasinoAuthWrapper />
      </PrivyProvider>
    </Provider>
  );
};

export default CasinoApp;