import React from 'react';
import { usePrivyAuth } from '../hooks/usePrivyAuth';

const AuthPage: React.FC = () => {
  const { 
    loginWithMonadGamesID, 
    isConnecting, 
    needsUsernameRegistration,
    registerUsernameUrl,
    error 
  } = usePrivyAuth();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🎴</div>
        <h1 className="auth-title">Monad Blackjack</h1>
        <p className="auth-subtitle">
          The ultimate blockchain blackjack experience on Monad testnet. 
          Every move is recorded on-chain, compete on the global leaderboard!
        </p>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '20px', color: '#ef4444' }}>
            ⚠️ {error}
          </div>
        )}
        
        <button
          className="connect-button"
          onClick={loginWithMonadGamesID}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="loading-spinner">⏳</span>
              Connecting...
            </>
          ) : (
            <>
              🎮 Sign in with Monad Games ID
            </>
          )}
        </button>
        
        {needsUsernameRegistration && (
          <div className="username-prompt">
            <h3>🎯 Reserve Your Username</h3>
            <p>
              You need a Monad Games ID username to compete on the leaderboard 
              and track your progress across all games.
            </p>
            <a
              href={registerUsernameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="register-username-btn"
            >
              Register Username
            </a>
          </div>
        )}
        
        <div style={{ marginTop: '32px', fontSize: '12px', color: '#64748b' }}>
          <p>🔗 Powered by Monad Games ID</p>
          <p>⛓️ All games recorded on Monad blockchain</p>
          <p>🏆 Global cross-game leaderboards</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;