import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store';

interface LeaderboardEntry {
  rank: number;
  username: string;
  walletAddress: string;
  wins: number;
  totalGames: number;
  winRate: number;
  totalWon: string;
  currentStreak: number;
  bestStreak: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'winRate' | 'wins' | 'bestStreak' | 'totalWon'>('winRate');
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would call your backend API
      // For now, we'll simulate some leaderboard data
      // This should integrate with the Monad Games ID leaderboard API when available
      
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          username: 'BlackjackKing',
          walletAddress: '0x1234...5678',
          wins: 47,
          totalGames: 60,
          winRate: 78.3,
          totalWon: '12.567',
          currentStreak: 8,
          bestStreak: 15
        },
        {
          rank: 2,
          username: 'CardShark',
          walletAddress: '0x2345...6789',
          wins: 38,
          totalGames: 52,
          winRate: 73.1,
          totalWon: '8.923',
          currentStreak: 3,
          bestStreak: 12
        },
        {
          rank: 3,
          username: 'LuckyAce',
          walletAddress: '0x3456...7890',
          wins: 29,
          totalGames: 42,
          winRate: 69.0,
          totalWon: '6.789',
          currentStreak: 0,
          bestStreak: 9
        },
        {
          rank: 4,
          username: 'MonadMaster',
          walletAddress: '0x4567...8901',
          wins: 24,
          totalGames: 36,
          winRate: 66.7,
          totalWon: '5.234',
          currentStreak: 2,
          bestStreak: 7
        },
        {
          rank: 5,
          username: 'DealerSlayer',
          walletAddress: '0x5678...9012',
          wins: 31,
          totalGames: 48,
          winRate: 64.6,
          totalWon: '4.567',
          currentStreak: 1,
          bestStreak: 11
        }
      ];

      // Add current user if they have stats
      if (user && user.hasUsername) {
        const userEntry: LeaderboardEntry = {
          rank: 6,
          username: user.username,
          walletAddress: user.walletAddress,
          wins: 0, // Would come from actual player stats
          totalGames: 0,
          winRate: 0,
          totalWon: '0.000',
          currentStreak: 0,
          bestStreak: 0
        };
        mockLeaderboard.push(userEntry);
      }

      // Sort the leaderboard
      const sorted = [...mockLeaderboard].sort((a, b) => {
        switch (sortBy) {
          case 'winRate':
            return b.winRate - a.winRate;
          case 'wins':
            return b.wins - a.wins;
          case 'bestStreak':
            return b.bestStreak - a.bestStreak;
          case 'totalWon':
            return parseFloat(b.totalWon) - parseFloat(a.totalWon);
          default:
            return 0;
        }
      });

      // Update ranks
      sorted.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getSortIcon = (column: string) => {
    return sortBy === column ? '🔽' : '⏹️';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard loading">
        <div className="leaderboard-header">
          <h2>🏆 Global Leaderboard</h2>
        </div>
        <div className="loading-content">
          <div className="loading-spinner">⏳</div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard error">
        <div className="leaderboard-header">
          <h2>🏆 Global Leaderboard</h2>
        </div>
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchLeaderboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Global Leaderboard</h2>
        <p className="leaderboard-subtitle">
          Compete with players across all Monad Games ID integrated games!
        </p>
      </div>

      <div className="leaderboard-controls">
        <div className="sort-buttons">
          <span className="sort-label">Sort by:</span>
          <button
            className={`sort-btn ${sortBy === 'winRate' ? 'active' : ''}`}
            onClick={() => setSortBy('winRate')}
          >
            {getSortIcon('winRate')} Win Rate
          </button>
          <button
            className={`sort-btn ${sortBy === 'wins' ? 'active' : ''}`}
            onClick={() => setSortBy('wins')}
          >
            {getSortIcon('wins')} Wins
          </button>
          <button
            className={`sort-btn ${sortBy === 'bestStreak' ? 'active' : ''}`}
            onClick={() => setSortBy('bestStreak')}
          >
            {getSortIcon('bestStreak')} Best Streak
          </button>
          <button
            className={`sort-btn ${sortBy === 'totalWon' ? 'active' : ''}`}
            onClick={() => setSortBy('totalWon')}
          >
            {getSortIcon('totalWon')} Total Won
          </button>
        </div>

        <button className="refresh-btn" onClick={fetchLeaderboard}>
          🔄 Refresh
        </button>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="col-rank">Rank</div>
          <div className="col-player">Player</div>
          <div className="col-games">Games</div>
          <div className="col-winrate">Win Rate</div>
          <div className="col-streak">Streak</div>
          <div className="col-earnings">Earnings</div>
        </div>

        <div className="table-body">
          {leaderboard.map((entry) => (
            <div
              key={entry.walletAddress}
              className={`leaderboard-row ${
                user?.walletAddress === entry.walletAddress ? 'current-user' : ''
              } ${entry.rank <= 3 ? 'top-three' : ''}`}
            >
              <div className="col-rank">
                <span className="rank-badge">
                  {getRankIcon(entry.rank)}
                </span>
              </div>
              
              <div className="col-player">
                <div className="player-info">
                  <span className="username">{entry.username}</span>
                  <span className="wallet">
                    {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                  </span>
                  {user?.walletAddress === entry.walletAddress && (
                    <span className="you-indicator">👤 You</span>
                  )}
                </div>
              </div>
              
              <div className="col-games">
                <div className="games-info">
                  <span className="wins">{entry.wins}W</span>
                  <span className="total">/{entry.totalGames}</span>
                </div>
              </div>
              
              <div className="col-winrate">
                <div className="winrate-info">
                  <span className="percentage">{entry.winRate.toFixed(1)}%</span>
                  <div className="winrate-bar">
                    <div 
                      className="winrate-fill" 
                      style={{ width: `${entry.winRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="col-streak">
                <div className="streak-info">
                  <span className="current">{entry.currentStreak}</span>
                  <span className="best">🏆{entry.bestStreak}</span>
                </div>
              </div>
              
              <div className="col-earnings">
                <span className="earnings">{parseFloat(entry.totalWon).toFixed(3)} MON</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="empty-leaderboard">
          <span className="empty-icon">🎯</span>
          <p>No players on the leaderboard yet.</p>
          <p>Be the first to play and claim your spot!</p>
        </div>
      )}

      <div className="leaderboard-footer">
        <p className="powered-by">
          Powered by <strong>Monad Games ID</strong> 🎮
        </p>
        <p className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;