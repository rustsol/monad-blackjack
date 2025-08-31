import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { soundManager } from '../utils/soundManager';

export interface CasinoState {
  // Visual effects
  isCardDealing: boolean;
  cardAnimations: CardAnimation[];
  tableTheme: 'classic' | 'modern' | 'luxury';
  
  // Sound settings
  soundEnabled: boolean;
  masterVolume: number;
  ambientPlaying: boolean;
  
  // Game atmosphere
  chipStackAnimations: ChipAnimation[];
  celebrationMode: boolean;
  bustAnimation: boolean;
  
  // UI enhancements
  showParticleEffects: boolean;
  cardGlowEffect: boolean;
  buttonHoverSounds: boolean;
}

export interface CardAnimation {
  id: string;
  type: 'deal' | 'flip' | 'slide' | 'glow';
  duration: number;
  delay: number;
  position: { x: number; y: number };
  card?: { suit: number; value: number };
}

export interface ChipAnimation {
  id: string;
  amount: string;
  position: { x: number; y: number };
  animation: 'stack' | 'scatter' | 'collect';
  duration: number;
}

const initialState: CasinoState = {
  // Visual effects
  isCardDealing: false,
  cardAnimations: [],
  tableTheme: 'luxury',
  
  // Sound settings
  soundEnabled: true,
  masterVolume: 0.7,
  ambientPlaying: false,
  
  // Game atmosphere
  chipStackAnimations: [],
  celebrationMode: false,
  bustAnimation: false,
  
  // UI enhancements
  showParticleEffects: true,
  cardGlowEffect: true,
  buttonHoverSounds: true,
};

// Async thunks for sound effects
export const playCardDealSound = createAsyncThunk(
  'casino/playCardDeal',
  async (delay: number = 0) => {
    soundManager.playCardDeal();
    return delay;
  }
);

export const playCardFlipSound = createAsyncThunk(
  'casino/playCardFlip',
  async () => {
    soundManager.playCardFlip();
  }
);

export const playChipPlaceSound = createAsyncThunk(
  'casino/playChipPlace',
  async (amount: string) => {
    soundManager.playChipPlace();
    return amount;
  }
);

export const playWinSound = createAsyncThunk(
  'casino/playWin',
  async (isBlackjack: boolean = false) => {
    if (isBlackjack) {
      soundManager.playBlackjack();
    } else {
      soundManager.playWin();
    }
    return isBlackjack;
  }
);

export const playLoseSound = createAsyncThunk(
  'casino/playLose',
  async (isBust: boolean = false) => {
    if (isBust) {
      soundManager.playBust();
    } else {
      soundManager.playLose();
    }
    return isBust;
  }
);

export const playTransactionSound = createAsyncThunk(
  'casino/playTransaction',
  async () => {
    soundManager.playTransaction();
  }
);

export const startAmbientSound = createAsyncThunk(
  'casino/startAmbient',
  async () => {
    soundManager.startAmbient();
  }
);

export const stopAmbientSound = createAsyncThunk(
  'casino/stopAmbient',
  async () => {
    soundManager.stopAmbient();
  }
);

const casinoSlice = createSlice({
  name: 'casino',
  initialState,
  reducers: {
    // Visual effects
    startCardDealing: (state) => {
      state.isCardDealing = true;
    },
    
    stopCardDealing: (state) => {
      state.isCardDealing = false;
    },
    
    addCardAnimation: (state, action: PayloadAction<CardAnimation>) => {
      state.cardAnimations.push(action.payload);
    },
    
    removeCardAnimation: (state, action: PayloadAction<string>) => {
      state.cardAnimations = state.cardAnimations.filter(
        anim => anim.id !== action.payload
      );
    },
    
    clearCardAnimations: (state) => {
      state.cardAnimations = [];
    },
    
    // Chip animations
    addChipAnimation: (state, action: PayloadAction<ChipAnimation>) => {
      state.chipStackAnimations.push(action.payload);
    },
    
    removeChipAnimation: (state, action: PayloadAction<string>) => {
      state.chipStackAnimations = state.chipStackAnimations.filter(
        anim => anim.id !== action.payload
      );
    },
    
    clearChipAnimations: (state) => {
      state.chipStackAnimations = [];
    },
    
    // Game atmosphere
    setCelebrationMode: (state, action: PayloadAction<boolean>) => {
      state.celebrationMode = action.payload;
    },
    
    setBustAnimation: (state, action: PayloadAction<boolean>) => {
      state.bustAnimation = action.payload;
    },
    
    // Sound controls
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
      soundManager.toggleSound();
      if (!action.payload) {
        state.ambientPlaying = false;
      }
    },
    
    setMasterVolume: (state, action: PayloadAction<number>) => {
      state.masterVolume = action.payload;
      soundManager.setMasterVolume(action.payload);
    },
    
    setAmbientPlaying: (state, action: PayloadAction<boolean>) => {
      state.ambientPlaying = action.payload;
    },
    
    // UI settings
    setTableTheme: (state, action: PayloadAction<'classic' | 'modern' | 'luxury'>) => {
      state.tableTheme = action.payload;
    },
    
    setShowParticleEffects: (state, action: PayloadAction<boolean>) => {
      state.showParticleEffects = action.payload;
    },
    
    setCardGlowEffect: (state, action: PayloadAction<boolean>) => {
      state.cardGlowEffect = action.payload;
    },
    
    setButtonHoverSounds: (state, action: PayloadAction<boolean>) => {
      state.buttonHoverSounds = action.payload;
    },
    
    // Complex actions
    dealCardsSequence: (state, action: PayloadAction<{cards: any[], isPlayer: boolean}>) => {
      state.isCardDealing = true;
      const { cards, isPlayer } = action.payload;
      
      // Create animations for each card
      cards.forEach((card, index) => {
        const animation: CardAnimation = {
          id: `deal-${Date.now()}-${index}`,
          type: 'deal',
          duration: 800,
          delay: index * 300,
          position: {
            x: isPlayer ? 100 : -100,
            y: isPlayer ? 100 : -100
          },
          card
        };
        state.cardAnimations.push(animation);
      });
    },
    
    triggerWinCelebration: (state, action: PayloadAction<{isBlackjack: boolean, payout: string}>) => {
      state.celebrationMode = true;
      const { isBlackjack, payout } = action.payload;
      
      // Add chip collection animation
      const chipAnimation: ChipAnimation = {
        id: `win-${Date.now()}`,
        amount: payout,
        position: { x: 0, y: 0 },
        animation: 'collect',
        duration: 1500
      };
      state.chipStackAnimations.push(chipAnimation);
    },
    
    triggerBustEffect: (state) => {
      state.bustAnimation = true;
      // Remove bust animation after duration
      setTimeout(() => {
        state.bustAnimation = false;
      }, 800);
    },
    
    resetCasinoEffects: (state) => {
      state.isCardDealing = false;
      state.cardAnimations = [];
      state.chipStackAnimations = [];
      state.celebrationMode = false;
      state.bustAnimation = false;
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(playCardDealSound.fulfilled, (state, action) => {
        // Card deal sound played successfully
      })
      .addCase(playWinSound.fulfilled, (state, action) => {
        if (action.payload) {
          // Blackjack win - extra celebration
          state.celebrationMode = true;
        }
      })
      .addCase(playLoseSound.fulfilled, (state, action) => {
        if (action.payload) {
          // Bust - trigger bust animation
          state.bustAnimation = true;
        }
      })
      .addCase(startAmbientSound.fulfilled, (state) => {
        state.ambientPlaying = true;
      })
      .addCase(stopAmbientSound.fulfilled, (state) => {
        state.ambientPlaying = false;
      });
  }
});

export const {
  startCardDealing,
  stopCardDealing,
  addCardAnimation,
  removeCardAnimation,
  clearCardAnimations,
  addChipAnimation,
  removeChipAnimation,
  clearChipAnimations,
  setCelebrationMode,
  setBustAnimation,
  setSoundEnabled,
  setMasterVolume,
  setAmbientPlaying,
  setTableTheme,
  setShowParticleEffects,
  setCardGlowEffect,
  setButtonHoverSounds,
  dealCardsSequence,
  triggerWinCelebration,
  triggerBustEffect,
  resetCasinoEffects
} = casinoSlice.actions;

export default casinoSlice.reducer;