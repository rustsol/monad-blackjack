import React from 'react';
import { useAppSelector } from '../store';

const PlayerStats: React.FC = () => {
  const { playerStats } = useAppSelector(state => state.game);
  const { user } = useAppSelector(state => state.auth);

  if (!playerStats) {
    return (
      <div className="player-stats loading">
        <div className="stats-header">
          <h3>📊 Player Stats</h3>
        </div>
        <div className="stats-loading">
          Loading stats...
        </div>
      </div>
    );
  }

  const totalGames = parseInt(playerStats.totalGames);
  const wins = parseInt(playerStats.wins);
  const losses = parseInt(playerStats.losses);
  const pushes = parseInt(playerStats.pushes);
  
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';
  const totalWagered = parseFloat(playerStats.totalWagered);
  const totalWon = parseFloat(playerStats.totalWon);
  const netProfit = totalWon - totalWagered;

  return (
    <div className="player-stats">
      <div className="stats-header">
        <h3>📊 Player Stats</h3>
        {user && user.hasUsername && (
          <div className="player-username">🎮 {user.username}</div>
        )}
      </div>
      
      <div className="stats-grid">
        {/* Games Summary */}
        <div className="stat-group games-summary">
          <h4>Games</h4>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Total Games</span>
              <span className="stat-value">{totalGames}</span>
            </div>
            <div className="stat-item wins">
              <span className="stat-label">Wins</span>
              <span className="stat-value">{wins}</span>
            </div>
            <div className="stat-item losses">
              <span className="stat-label">Losses</span>
              <span className="stat-value">{losses}</span>
            </div>
            <div className="stat-item pushes">
              <span className="stat-label">Pushes</span>
              <span className="stat-value">{pushes}</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="stat-group performance">
          <h4>Performance</h4>
          <div className="stat-items">
            <div className="stat-item win-rate">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{winRate}%</span>
            </div>
            <div className="stat-item current-streak">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{playerStats.currentStreak}</span>
            </div>
            <div className="stat-item best-streak">
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">🏆 {playerStats.bestStreak}</span>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="stat-group financial">
          <h4>Financial</h4>
          <div className="stat-items">
            <div className="stat-item wagered">
              <span className="stat-label">Total Wagered</span>
              <span className="stat-value">{totalWagered.toFixed(3)} MON</span>
            </div>
            <div className="stat-item won">
              <span className="stat-label">Total Won</span>
              <span className="stat-value">{totalWon.toFixed(3)} MON</span>
            </div>
            <div className={`stat-item profit ${netProfit >= 0 ? 'positive' : 'negative'}`}>
              <span className="stat-label">Net Profit</span>
              <span className="stat-value">
                {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(3)} MON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements/Badges */}
      <div className="achievements">
        <h4>🏆 Achievements</h4>
        <div className="badge-container">
          {wins >= 1 && (
            <span className="badge first-win" title="First Win">🎯 First Win</span>
          )}
          {wins >= 10 && (
            <span className="badge ten-wins" title="10 Wins">🔥 Hot Streak</span>
          )}
          {wins >= 50 && (
            <span className="badge fifty-wins" title="50 Wins">💎 Diamond Player</span>
          )}
          {parseInt(playerStats.bestStreak) >= 5 && (
            <span className="badge streak-master" title="5+ Win Streak">⚡ Streak Master</span>
          )}
          {parseFloat(winRate) >= 60 && totalGames >= 10 && (
            <span className="badge high-roller" title="60%+ Win Rate">👑 High Roller</span>
          )}
          {netProfit >= 1 && (
            <span className="badge profitable" title="1+ MON Profit">💰 Profitable</span>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-icon">🎯</span>
          <span className="quick-stat-text">{winRate}% Win Rate</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-icon">🔥</span>
          <span className="quick-stat-text">{playerStats.currentStreak} Streak</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-icon">💰</span>
          <span className="quick-stat-text">
            {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(3)} MON
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;