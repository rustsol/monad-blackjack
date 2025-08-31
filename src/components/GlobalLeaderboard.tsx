import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  wins: number;
  losses: number;
  pushes: number;
  totalGames: number;
  winRate: number;
  totalWagered: string;
  totalWon: string;
  netProfit: string;
  currentStreak: number;
  bestStreak: number;
}

// Contract ABI for the functions we need
const BLACKJACK_ABI = [
  "function playerStats(address) view returns (uint256 totalGames, uint256 wins, uint256 losses, uint256 pushes, uint256 totalWagered, uint256 totalWon, uint256 currentStreak, uint256 bestStreak)",
  "function gameCounter() view returns (uint256)",
  "function gameHistory(uint256) view returns (address player, uint256 bet, uint8 gameStatus, bool isActive, uint256 gameId, bool dealerTurn, uint256 timestamp)",
  "event GameStarted(address indexed player, uint256 gameId, uint256 bet)",
  "event GameEnded(address indexed player, uint256 gameId, uint8 result, uint256 payout)"
];

// Monad Games ID Contract ABI
const MONAD_GAMES_ID_ABI = [
  "function getGamePlayers(address game) view returns (address[])",
  "function playerScores(address game, address player) view returns (uint256 score, uint256 transactions)"
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x514ec466486046902079901d53f61f6753455aba';
const MONAD_GAMES_ID_ADDRESS = process.env.REACT_APP_MONAD_GAMES_ID_CONTRACT || '0xceCBFF203C8B6044F52CE23D914A1bfD997541A4';
const RPC_URL = process.env.REACT_APP_RPC_URL || 'https://testnet-rpc.monad.xyz';

const GlobalLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'netProfit' | 'streak'>('wins');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
    
    // Get current wallet
    if (window.ethereum) {
      (window.ethereum as any).request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setCurrentWallet(accounts[0].toLowerCase());
          }
        })
        .catch(console.error);
    }
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Connecting to Monad network...');
      console.log('Starting leaderboard fetch...');

      // Create provider and contracts
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const blackjackContract = new ethers.Contract(CONTRACT_ADDRESS, BLACKJACK_ABI, provider);
      
      setDebugInfo('Fetching all players...');
      
      // Get all unique players using multiple methods
      const uniquePlayers = new Set<string>();
      
      // Method 1: Try to get game counter and iterate through game history
      try {
        const gameCount = await blackjackContract.gameCounter();
        const totalGames = Number(gameCount);
        console.log(`Total games played: ${totalGames}`);
        setDebugInfo(`Found ${totalGames} total games...`);
        
        // Fetch game history to find all players
        const batchSize = 50; // Process games in batches
        for (let i = 1; i <= totalGames; i += batchSize) {
          const promises = [];
          for (let j = i; j < Math.min(i + batchSize, totalGames + 1); j++) {
            promises.push(blackjackContract.gameHistory(j).catch(() => null));
          }
          
          const games = await Promise.all(promises);
          games.forEach((game) => {
            if (game && game.player && game.player !== ethers.ZeroAddress) {
              uniquePlayers.add(game.player.toLowerCase());
            }
          });
          
          setDebugInfo(`Processing games ${i} to ${Math.min(i + batchSize - 1, totalGames)}... Found ${uniquePlayers.size} players`);
        }
      } catch (err) {
        console.error('Error fetching game history:', err);
      }
      
      // Method 2: Try to fetch from events (all blocks from genesis)
      if (uniquePlayers.size === 0) {
        try {
          console.log('Falling back to event scanning...');
          setDebugInfo('Scanning blockchain events...');
          
          const filter = blackjackContract.filters.GameEnded();
          // Fetch ALL events from contract deployment (block 0 to latest)
          const events = await blackjackContract.queryFilter(filter, 0, 'latest')
            .catch(() => []);
          
          console.log(`Found ${events.length} GameEnded events`);
          
          events.forEach((event: any) => {
            if (event.args && event.args[0]) {
              uniquePlayers.add(event.args[0].toLowerCase());
            }
          });
          
          // Also try GameStarted events
          const startFilter = blackjackContract.filters.GameStarted();
          const startEvents = await blackjackContract.queryFilter(startFilter, 0, 'latest')
            .catch(() => []);
          
          console.log(`Found ${startEvents.length} GameStarted events`);
          
          startEvents.forEach((event: any) => {
            if (event.args && event.args[0]) {
              uniquePlayers.add(event.args[0].toLowerCase());
            }
          });
        } catch (err) {
          console.error('Error fetching events:', err);
        }
      }
      
      // Method 3: Try Monad Games ID contract
      try {
        console.log('Checking Monad Games ID contract...');
        const monadGamesContract = new ethers.Contract(MONAD_GAMES_ID_ADDRESS, MONAD_GAMES_ID_ABI, provider);
        const players = await monadGamesContract.getGamePlayers(CONTRACT_ADDRESS).catch(() => []);
        if (Array.isArray(players)) {
          players.forEach((player: string) => {
            if (player && player !== ethers.ZeroAddress) {
              uniquePlayers.add(player.toLowerCase());
            }
          });
          console.log(`Found ${players.length} players from Monad Games ID`);
        }
      } catch (err) {
        console.log('Could not fetch from Monad Games ID:', err);
      }
      
      console.log(`Total unique players found: ${uniquePlayers.size}`);
      setDebugInfo(`Fetching stats for ${uniquePlayers.size} players...`);
      
      // If no players found, show message but don't add dummy data
      if (uniquePlayers.size === 0) {
        setLeaderboard([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Fetch stats for ALL players found
      const playerDataPromises = Array.from(uniquePlayers).map(async (playerAddress) => {
        try {
          const stats = await blackjackContract.playerStats(playerAddress);
          
          // Fetch username from Monad Games ID
          let username = 'Anonymous';
          try {
            const response = await fetch(
              `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${playerAddress}`
            );
            const data = await response.json();
            if (data.hasUsername && data.user) {
              username = data.user.username;
            }
          } catch (err) {
            // Silent fail for username fetch
          }
          
          const totalGames = Number(stats[0]);
          const wins = Number(stats[1]);
          const losses = Number(stats[2]);
          const pushes = Number(stats[3]);
          const totalWagered = ethers.formatEther(stats[4]);
          const totalWon = ethers.formatEther(stats[5]);
          const currentStreak = Number(stats[6]);
          const bestStreak = Number(stats[7]);
          
          // Include ALL players, even with 0 games (they might have active games)
          const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
          const netProfit = (parseFloat(totalWon) - parseFloat(totalWagered)).toFixed(4);
          
          return {
            rank: 0,
            address: playerAddress,
            username,
            wins,
            losses,
            pushes,
            totalGames,
            winRate,
            totalWagered,
            totalWon,
            netProfit,
            currentStreak,
            bestStreak
          };
        } catch (err) {
          console.error('Error fetching stats for', playerAddress, err);
          return null;
        }
      });
      
      const playerData = (await Promise.all(playerDataPromises))
        .filter((data): data is LeaderboardEntry => data !== null)
        .filter(data => data.totalGames > 0); // Only show players who have completed games
      
      console.log('Final player data:', playerData);
      setDebugInfo(`Loaded ${playerData.length} players with completed games`);
      
      // Sort and rank
      const sortedData = [...playerData].sort((a, b) => {
        switch (sortBy) {
          case 'wins':
            return b.wins - a.wins || b.winRate - a.winRate;
          case 'winRate':
            return b.winRate - a.winRate || b.wins - a.wins;
          case 'netProfit':
            return parseFloat(b.netProfit) - parseFloat(a.netProfit);
          case 'streak':
            return b.bestStreak - a.bestStreak || b.wins - a.wins;
          default:
            return b.wins - a.wins;
        }
      });
      
      const rankedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      setLeaderboard(rankedData);
      setError(null);
    } catch (err: any) {
      console.error('Error in fetchLeaderboardData:', err);
      setError(err.message || 'Failed to load leaderboard');
      setDebugInfo('Error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getTrophyEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getBadges = (entry: LeaderboardEntry) => {
    const badges = [];
    if (entry.winRate >= 60) badges.push('🎯 Sharp');
    if (entry.bestStreak >= 10) badges.push('🔥 Hot');
    if (parseFloat(entry.netProfit) >= 10) badges.push('💰 Whale');
    if (entry.totalGames >= 100) badges.push('⭐ Veteran');
    if (entry.totalGames >= 10 && entry.winRate >= 50) badges.push('💎 Pro');
    return badges;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Re-sort when sortBy changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      const sortedData = [...leaderboard].sort((a, b) => {
        switch (sortBy) {
          case 'wins':
            return b.wins - a.wins || b.winRate - a.winRate;
          case 'winRate':
            return b.winRate - a.winRate || b.wins - a.wins;
          case 'netProfit':
            return parseFloat(b.netProfit) - parseFloat(a.netProfit);
          case 'streak':
            return b.bestStreak - a.bestStreak || b.wins - a.wins;
          default:
            return b.wins - a.wins;
        }
      });
      
      const rankedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      setLeaderboard(rankedData);
    }
  }, [sortBy]);

  return (
    <div className="global-leaderboard">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">
          🏆 Global Leaderboard
        </h1>
        <p className="leaderboard-subtitle">
          Monad Blackjack Champions - All Players
        </p>
      </div>

      <div className="leaderboard-controls">
        <div className="sort-buttons">
          <button 
            className={`sort-btn ${sortBy === 'wins' ? 'active' : ''}`}
            onClick={() => setSortBy('wins')}
          >
            Most Wins
          </button>
          <button 
            className={`sort-btn ${sortBy === 'winRate' ? 'active' : ''}`}
            onClick={() => setSortBy('winRate')}
          >
            Win Rate
          </button>
          <button 
            className={`sort-btn ${sortBy === 'netProfit' ? 'active' : ''}`}
            onClick={() => setSortBy('netProfit')}
          >
            Net Profit
          </button>
          <button 
            className={`sort-btn ${sortBy === 'streak' ? 'active' : ''}`}
            onClick={() => setSortBy('streak')}
          >
            Best Streak
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading all players from blockchain...</p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {debugInfo}
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{debugInfo}</p>
          <button onClick={fetchLeaderboardData} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {!loading && !error && leaderboard.length === 0 && (
        <div className="empty-state">
          <p>No players have completed games yet. Be the first champion!</p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '1rem' }}>
            Start playing to appear on the leaderboard
          </p>
        </div>
      )}

      {!loading && !error && leaderboard.length > 0 && (
        <>
          <div className="leaderboard-stats">
            <p>Total Players: {leaderboard.length} | Total Games: {leaderboard.reduce((sum, p) => sum + p.totalGames, 0)}</p>
          </div>
          
          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Games</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win Rate</th>
                  <th>Net Profit</th>
                  <th>Best Streak</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr 
                    key={entry.address} 
                    className={`
                      rank-${entry.rank <= 3 ? 'top' : 'regular'} 
                      ${entry.address.toLowerCase() === currentWallet ? 'current-player' : ''}
                    `}
                  >
                    <td className="rank-cell">
                      <span className="rank-number">{entry.rank}</span>
                      <span className="trophy">{getTrophyEmoji(entry.rank)}</span>
                    </td>
                    <td className="player-cell">
                      <div className="player-info">
                        <span className="player-username">
                          {entry.username}
                          {entry.address.toLowerCase() === currentWallet && ' (You)'}
                        </span>
                        <span className="player-address">{formatAddress(entry.address)}</span>
                      </div>
                    </td>
                    <td>{entry.totalGames}</td>
                    <td className="wins-cell">{entry.wins}</td>
                    <td className="losses-cell">{entry.losses}</td>
                    <td className="winrate-cell">
                      <span className={`winrate ${entry.winRate >= 50 ? 'positive' : 'negative'}`}>
                        {entry.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`profit-cell ${parseFloat(entry.netProfit) >= 0 ? 'profit' : 'loss'}`}>
                      {parseFloat(entry.netProfit) >= 0 ? '+' : ''}{entry.netProfit} MON
                    </td>
                    <td>
                      <span className="streak-badge">
                        {entry.bestStreak} 🔥
                      </span>
                    </td>
                    <td className="badges-cell">
                      <div className="badges">
                        {getBadges(entry).map((badge, idx) => (
                          <span key={idx} className="badge" title={badge}>
                            {badge}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="leaderboard-footer">
        <p className="footer-text">
          Contract: {formatAddress(CONTRACT_ADDRESS)} • Real-time blockchain data
        </p>
        <button onClick={fetchLeaderboardData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;