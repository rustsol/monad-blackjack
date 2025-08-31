import React from 'react';
import './index.simple.css';

const App: React.FC = () => {
  return (
    <div className="app" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      padding: '20px'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>🎴 Monad Blackjack</h1>
        <p style={{ fontSize: '18px', color: '#94a3b8' }}>
          The ultimate blockchain blackjack experience on Monad testnet
        </p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h2 style={{ color: '#ffd700', marginBottom: '24px' }}>🚀 Ready to Deploy!</h2>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#10b981', marginBottom: '16px' }}>✅ Features Implemented</h3>
            <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto', listStyle: 'none' }}>
              <li>🔗 Full Blockchain Integration</li>
              <li>🎮 Monad Games ID Authentication</li>
              <li>⚡ Redux State Management</li>
              <li>🎨 Responsive UI with Animations</li>
              <li>📊 Real-time Stats & Leaderboard</li>
              <li>💎 Smart Contract Game Logic</li>
            </ul>
          </div>

          <div style={{ 
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#fbbf24', marginBottom: '12px' }}>📝 Next Steps</h3>
            <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
              <li>1. Deploy the smart contract to Monad testnet</li>
              <li>2. Set up Privy App ID for authentication</li>
              <li>3. Update environment variables in .env</li>
              <li>4. Register game with Monad Games ID</li>
              <li>5. Launch and start playing!</li>
            </ol>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '16px'
            }}>
              📂 View Code
            </button>
            <button style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              📚 Documentation
            </button>
          </div>
        </div>

        <div style={{ 
          marginTop: '40px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>🎮 Built for Monad Games ID Mission 7</p>
          <p>⛓️ Every move recorded on blockchain</p>
          <p>🏆 Global cross-game leaderboards</p>
        </div>
      </main>
    </div>
  );
};

export default App;