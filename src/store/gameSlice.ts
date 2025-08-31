import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GameState, PlayerStats, GameUI, Card, GameResult, calculateHandValue } from '../types/game';
import { contractService } from '../utils/contractService';

interface GameSliceState {
  gameState: GameState | null;
  playerStats: PlayerStats | null;
  ui: GameUI;
  history: GameState[];
}

const initialState: GameSliceState = {
  gameState: null,
  playerStats: null,
  ui: {
    isLoading: false,
    error: null,
    showResult: false,
    resultMessage: '',
    canHit: false,
    canStand: false,
    canDoubleDown: false,
    playerHandValue: 0,
    dealerHandValue: 0,
    dealerHideCard: true,
  },
  history: [],
};

// Async thunks for blockchain operations
export const startNewGame = createAsyncThunk(
  'game/startNewGame',
  async (betAmount: string, { rejectWithValue }) => {
    try {
      const tx = await contractService.startGame(betAmount);
      await tx.wait();
      return betAmount;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start game');
    }
  }
);

export const hitCard = createAsyncThunk(
  'game/hitCard',
  async (_, { rejectWithValue }) => {
    try {
      const tx = await contractService.hit();
      await tx.wait();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to hit');
    }
  }
);

export const stand = createAsyncThunk(
  'game/stand',
  async (_, { rejectWithValue }) => {
    try {
      const tx = await contractService.stand();
      await tx.wait();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to stand');
    }
  }
);

export const doubleDown = createAsyncThunk(
  'game/doubleDown',
  async (betAmount: string, { rejectWithValue }) => {
    try {
      const tx = await contractService.doubleDown(betAmount);
      await tx.wait();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to double down');
    }
  }
);

export const loadGameState = createAsyncThunk(
  'game/loadGameState',
  async (playerAddress: string, { rejectWithValue }) => {
    try {
      const gameState = await contractService.getGameState(playerAddress);
      const playerStats = await contractService.getPlayerStats(playerAddress);
      return { gameState, playerStats };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load game state');
    }
  }
);

export const forfeitGame = createAsyncThunk(
  'game/forfeitGame',
  async (_, { rejectWithValue }) => {
    try {
      const tx = await contractService.forfeitGame();
      await tx.wait();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to forfeit game');
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateGameStateFromEvent: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
      state.ui = {
        ...state.ui,
        playerHandValue: calculateHandValue(action.payload.playerCards),
        dealerHandValue: calculateHandValue(action.payload.dealerCards),
        canHit: action.payload.isActive && !action.payload.dealerTurn,
        canStand: action.payload.isActive && !action.payload.dealerTurn,
        canDoubleDown: action.payload.isActive && 
                      !action.payload.dealerTurn && 
                      action.payload.playerCards.length === 2,
        dealerHideCard: action.payload.isActive && !action.payload.dealerTurn,
      };
    },
    
    updatePlayerStatsFromEvent: (state, action: PayloadAction<PlayerStats>) => {
      state.playerStats = action.payload;
    },
    
    addCardFromEvent: (state, action: PayloadAction<{ 
      card: Card; 
      isDealer: boolean; 
      gameId: string; 
    }>) => {
      if (state.gameState && state.gameState.gameId === action.payload.gameId) {
        if (action.payload.isDealer) {
          state.gameState.dealerCards.push(action.payload.card);
        } else {
          state.gameState.playerCards.push(action.payload.card);
        }
        
        // Update UI values
        state.ui.playerHandValue = calculateHandValue(state.gameState.playerCards);
        state.ui.dealerHandValue = calculateHandValue(state.gameState.dealerCards);
      }
    },
    
    gameEndedFromEvent: (state, action: PayloadAction<{
      gameId: string;
      result: GameResult;
      payout: string;
    }>) => {
      if (state.gameState && state.gameState.gameId === action.payload.gameId) {
        state.gameState.gameStatus = action.payload.result;
        state.gameState.isActive = false;
        state.ui.dealerHideCard = false;
        state.ui.showResult = true;
        state.ui.canHit = false;
        state.ui.canStand = false;
        state.ui.canDoubleDown = false;
        
        // Set result message
        switch (action.payload.result) {
          case GameResult.PLAYER_WIN:
            state.ui.resultMessage = `You won! +${action.payload.payout} MON`;
            break;
          case GameResult.DEALER_WIN:
            state.ui.resultMessage = 'Dealer wins. Better luck next time!';
            break;
          case GameResult.PUSH:
            state.ui.resultMessage = 'Push! Your bet is returned.';
            break;
        }
        
        // Add to history
        state.history.unshift({ ...state.gameState });
      }
    },
    
    clearError: (state) => {
      state.ui.error = null;
    },
    
    hideResult: (state) => {
      state.ui.showResult = false;
      state.ui.resultMessage = '';
    },
    
    resetGame: (state) => {
      state.gameState = null;
      state.ui = {
        ...initialState.ui,
        error: state.ui.error, // Keep error if any
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Start new game
      .addCase(startNewGame.pending, (state) => {
        state.ui.isLoading = true;
        state.ui.error = null;
      })
      .addCase(startNewGame.fulfilled, (state) => {
        state.ui.isLoading = false;
      })
      .addCase(startNewGame.rejected, (state, action) => {
        state.ui.isLoading = false;
        state.ui.error = action.payload as string;
      })
      
      // Hit card
      .addCase(hitCard.pending, (state) => {
        state.ui.isLoading = true;
        state.ui.error = null;
      })
      .addCase(hitCard.fulfilled, (state) => {
        state.ui.isLoading = false;
      })
      .addCase(hitCard.rejected, (state, action) => {
        state.ui.isLoading = false;
        state.ui.error = action.payload as string;
      })
      
      // Stand
      .addCase(stand.pending, (state) => {
        state.ui.isLoading = true;
        state.ui.error = null;
      })
      .addCase(stand.fulfilled, (state) => {
        state.ui.isLoading = false;
      })
      .addCase(stand.rejected, (state, action) => {
        state.ui.isLoading = false;
        state.ui.error = action.payload as string;
      })
      
      // Double down
      .addCase(doubleDown.pending, (state) => {
        state.ui.isLoading = true;
        state.ui.error = null;
      })
      .addCase(doubleDown.fulfilled, (state) => {
        state.ui.isLoading = false;
      })
      .addCase(doubleDown.rejected, (state, action) => {
        state.ui.isLoading = false;
        state.ui.error = action.payload as string;
      })
      
      // Load game state
      .addCase(loadGameState.pending, (state) => {
        state.ui.isLoading = true;
        state.ui.error = null;
      })
      .addCase(loadGameState.fulfilled, (state, action) => {
        state.ui.isLoading = false;
        state.gameState = action.payload.gameState;
        state.playerStats = action.payload.playerStats;
        
        if (action.payload.gameState && action.payload.gameState.isActive) {
          state.ui.playerHandValue = calculateHandValue(action.payload.gameState.playerCards);
          state.ui.dealerHandValue = calculateHandValue(action.payload.gameState.dealerCards);
          state.ui.canHit = !action.payload.gameState.dealerTurn;
          state.ui.canStand = !action.payload.gameState.dealerTurn;
          state.ui.canDoubleDown = !action.payload.gameState.dealerTurn && 
                                  action.payload.gameState.playerCards.length === 2;
          state.ui.dealerHideCard = !action.payload.gameState.dealerTurn;
        }
      })
      .addCase(loadGameState.rejected, (state, action) => {
        state.ui.isLoading = false;
        state.ui.error = action.payload as string;
      })
      
      // Forfeit game
      .addCase(forfeitGame.pending, (state) => {
        state.ui.isLoading = true;
        state.ui.error = null;
      })
      .addCase(forfeitGame.fulfilled, (state) => {
        state.ui.isLoading = false;
      })
      .addCase(forfeitGame.rejected, (state, action) => {
        state.ui.isLoading = false;
        state.ui.error = action.payload as string;
      });
  },
});

export const {
  updateGameStateFromEvent,
  updatePlayerStatsFromEvent,
  addCardFromEvent,
  gameEndedFromEvent,
  clearError,
  hideResult,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;