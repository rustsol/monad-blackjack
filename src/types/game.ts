export interface Card {
  suit: number; // 0=Hearts, 1=Diamonds, 2=Clubs, 3=Spades
  value: number; // 1=Ace, 11=Jack, 12=Queen, 13=King
}

export interface GameState {
  player: string;
  playerCards: Card[];
  dealerCards: Card[];
  bet: string;
  gameStatus: number; // 0=InProgress, 1=PlayerWin, 2=DealerWin, 3=Push
  isActive: boolean;
  gameId: string;
  dealerTurn: boolean;
  timestamp: string;
}

export interface PlayerStats {
  totalGames: string;
  wins: string;
  losses: string;
  pushes: string;
  totalWagered: string;
  totalWon: string;
  currentStreak: string;
  bestStreak: string;
}

export interface GameUI {
  isLoading: boolean;
  error: string | null;
  showResult: boolean;
  resultMessage: string;
  canHit: boolean;
  canStand: boolean;
  canDoubleDown: boolean;
  playerHandValue: number;
  dealerHandValue: number;
  dealerHideCard: boolean;
}

export interface MonadUser {
  username: string;
  walletAddress: string;
  hasUsername: boolean;
}

export enum GameResult {
  IN_PROGRESS = 0,
  PLAYER_WIN = 1,
  DEALER_WIN = 2,
  PUSH = 3
}

export enum CardSuit {
  HEARTS = 0,
  DIAMONDS = 1,
  CLUBS = 2,
  SPADES = 3
}

export const SUIT_NAMES = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
export const SUIT_SYMBOLS = ['♥️', '♦️', '♣️', '♠️'];
export const SUIT_COLORS = ['red', 'red', 'black', 'black'];

export const getCardName = (card: Card): string => {
  const suitName = SUIT_NAMES[card.suit];
  let valueName: string;
  
  if (card.value === 1) {
    valueName = 'Ace';
  } else if (card.value === 11) {
    valueName = 'Jack';
  } else if (card.value === 12) {
    valueName = 'Queen';
  } else if (card.value === 13) {
    valueName = 'King';
  } else {
    valueName = card.value.toString();
  }
  
  return `${valueName} of ${suitName}`;
};

export const getCardDisplayValue = (card: Card): string => {
  if (card.value === 1) return 'A';
  if (card.value === 11) return 'J';
  if (card.value === 12) return 'Q';
  if (card.value === 13) return 'K';
  return card.value.toString();
};

export const calculateHandValue = (cards: Card[]): number => {
  let total = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.value === 1) {
      aces++;
      total += 11;
    } else if (card.value > 10) {
      total += 10;
    } else {
      total += card.value;
    }
  }
  
  // Adjust for aces
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
};