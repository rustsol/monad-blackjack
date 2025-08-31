import { ethers } from 'ethers';
import { GameState, PlayerStats, Card } from '../types/game';

// Contract ABI - matching the deployed BlackjackGame contract
const BLACKJACK_ABI = [
  // Core game functions
  "function startGame() external payable",
  "function hit() external",
  "function stand() external",
  "function doubleDown() external payable",
  "function forfeitGame() external",
  
  // View functions
  "function getGameState(address player) external view returns (tuple(address player, tuple(uint8 suit, uint8 value)[] playerCards, tuple(uint8 suit, uint8 value)[] dealerCards, uint256 bet, uint8 gameStatus, bool isActive, uint256 gameId, bool dealerTurn, uint256 timestamp))",
  "function getPlayerStats(address player) external view returns (tuple(uint256 totalGames, uint256 wins, uint256 losses, uint256 pushes, uint256 totalWagered, uint256 totalWon, uint256 currentStreak, uint256 bestStreak))",
  "function getPlayerCards(address player) external view returns (tuple(uint8 suit, uint8 value)[])",
  "function getDealerCards(address player) external view returns (tuple(uint8 suit, uint8 value)[])",
  "function isGameActive(address player) external view returns (bool)",
  "function getContractBalance() external view returns (uint256)",
  
  // Constants
  "function MIN_BET() external view returns (uint256)",
  "function MAX_BET() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function monadGamesIDContract() external view returns (address)",
  
  // Events
  "event GameStarted(address indexed player, uint256 gameId, uint256 bet, uint256 timestamp)",
  "event CardDealt(address indexed player, uint256 gameId, uint8 suit, uint8 value, bool isDealer, uint256 timestamp)",
  "event GameEnded(address indexed player, uint256 gameId, uint8 result, uint256 payout, uint256 timestamp)",
  "event StatsUpdated(address indexed player, uint256 totalGames, uint256 wins, uint256 losses)"
];

class ContractService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;
  private provider: ethers.Provider | null = null;

  async initialize(signer: ethers.Signer) {
    this.signer = signer;
    this.provider = signer.provider;
    
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    this.contract = new ethers.Contract(contractAddress, BLACKJACK_ABI, signer);
  }

  async initializeReadOnly(provider: ethers.Provider) {
    this.provider = provider;
    this.signer = null;
    
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    this.contract = new ethers.Contract(contractAddress, BLACKJACK_ABI, provider);
  }

  private ensureInitialized(requireSigner: boolean = true) {
    if (!this.contract) {
      throw new Error('Contract service not initialized');
    }
    if (requireSigner && !this.signer) {
      throw new Error('Signer required for this operation. Please connect your wallet.');
    }
  }

  async startGame(betAmountInETH: string): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    const betValue = ethers.parseEther(betAmountInETH);
    return await this.contract!.startGame({ value: betValue });
  }

  async hit(): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    return await this.contract!.hit();
  }

  async stand(): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    return await this.contract!.stand();
  }

  async doubleDown(betAmountInETH: string): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    const betValue = ethers.parseEther(betAmountInETH);
    return await this.contract!.doubleDown({ value: betValue });
  }

  async forfeitGame(): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    return await this.contract!.forfeitGame();
  }

  async getGameState(playerAddress: string): Promise<GameState> {
    this.ensureInitialized(false); // Read-only operation, no signer required
    const result = await this.contract!.getGameState(playerAddress);
    
    return {
      player: result.player,
      playerCards: result.playerCards.map((card: any) => ({
        suit: Number(card.suit),
        value: Number(card.value)
      })),
      dealerCards: result.dealerCards.map((card: any) => ({
        suit: Number(card.suit),
        value: Number(card.value)
      })),
      bet: ethers.formatEther(result.bet),
      gameStatus: Number(result.gameStatus),
      isActive: result.isActive,
      gameId: result.gameId.toString(),
      dealerTurn: result.dealerTurn,
      timestamp: result.timestamp.toString()
    };
  }

  async getPlayerStats(playerAddress: string): Promise<PlayerStats> {
    this.ensureInitialized(false); // Read-only operation, no signer required
    const result = await this.contract!.getPlayerStats(playerAddress);
    
    return {
      totalGames: result.totalGames.toString(),
      wins: result.wins.toString(),
      losses: result.losses.toString(),
      pushes: result.pushes.toString(),
      totalWagered: ethers.formatEther(result.totalWagered),
      totalWon: ethers.formatEther(result.totalWon),
      currentStreak: result.currentStreak.toString(),
      bestStreak: result.bestStreak.toString()
    };
  }

  async isGameActive(playerAddress: string): Promise<boolean> {
    this.ensureInitialized();
    return await this.contract!.isGameActive(playerAddress);
  }

  async getPlayerCards(playerAddress: string): Promise<Card[]> {
    this.ensureInitialized();
    const result = await this.contract!.getPlayerCards(playerAddress);
    return result.map((card: any) => ({
      suit: Number(card.suit),
      value: Number(card.value)
    }));
  }

  async getDealerCards(playerAddress: string): Promise<Card[]> {
    this.ensureInitialized();
    const result = await this.contract!.getDealerCards(playerAddress);
    return result.map((card: any) => ({
      suit: Number(card.suit),
      value: Number(card.value)
    }));
  }

  async getMinBet(): Promise<string> {
    this.ensureInitialized();
    const result = await this.contract!.MIN_BET();
    return ethers.formatEther(result);
  }

  async getMaxBet(): Promise<string> {
    this.ensureInitialized();
    const result = await this.contract!.MAX_BET();
    return ethers.formatEther(result);
  }

  async getContractBalance(): Promise<string> {
    this.ensureInitialized();
    const result = await this.contract!.getContractBalance();
    return ethers.formatEther(result);
  }

  async getOwner(): Promise<string> {
    this.ensureInitialized();
    return await this.contract!.owner();
  }

  async getMonadGamesIDContract(): Promise<string> {
    this.ensureInitialized();
    return await this.contract!.monadGamesIDContract();
  }

  // Event listeners for real-time updates
  setupEventListeners(playerAddress: string, callbacks: {
    onGameStarted?: (gameId: string, bet: string) => void;
    onCardDealt?: (gameId: string, suit: number, value: number, isDealer: boolean) => void;
    onPlayerAction?: (gameId: string, action: string) => void;
    onGameEnded?: (gameId: string, result: number, payout: string) => void;
    onStatsUpdated?: (wins: string, losses: string, streak: string) => void;
  }) {
    this.ensureInitialized();

    // Filter events for the specific player
    const playerFilter = this.contract!.filters.GameStarted(playerAddress);
    const cardFilter = this.contract!.filters.CardDealt(playerAddress);
    const actionFilter = this.contract!.filters.PlayerAction(playerAddress);
    const endFilter = this.contract!.filters.GameEnded(playerAddress);
    const statsFilter = this.contract!.filters.StatsUpdated(playerAddress);

    if (callbacks.onGameStarted) {
      this.contract!.on(playerFilter, (player, gameId, bet) => {
        callbacks.onGameStarted!(gameId.toString(), ethers.formatEther(bet));
      });
    }

    if (callbacks.onCardDealt) {
      this.contract!.on(cardFilter, (player, gameId, suit, value, isDealer) => {
        callbacks.onCardDealt!(
          gameId.toString(),
          Number(suit),
          Number(value),
          isDealer
        );
      });
    }

    if (callbacks.onPlayerAction) {
      this.contract!.on(actionFilter, (player, gameId, action) => {
        callbacks.onPlayerAction!(gameId.toString(), action);
      });
    }

    if (callbacks.onGameEnded) {
      this.contract!.on(endFilter, (player, gameId, result, payout) => {
        callbacks.onGameEnded!(
          gameId.toString(),
          Number(result),
          ethers.formatEther(payout)
        );
      });
    }

    if (callbacks.onStatsUpdated) {
      this.contract!.on(statsFilter, (player, wins, losses, streak) => {
        callbacks.onStatsUpdated!(
          wins.toString(),
          losses.toString(),
          streak.toString()
        );
      });
    }
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  getContractAddress(): string {
    return process.env.REACT_APP_CONTRACT_ADDRESS || '';
  }

  isInitialized(): boolean {
    return this.contract !== null;
  }

  getContract(): ethers.Contract | null {
    return this.contract;
  }
}

export const contractService = new ContractService();