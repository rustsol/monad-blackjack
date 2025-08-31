import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { 
  addCardFromEvent, 
  gameEndedFromEvent, 
  updatePlayerStatsFromEvent 
} from '../store/gameSlice';
import { contractService } from '../utils/contractService';
import { GameResult } from '../types/game';

export const useContractEvents = (walletAddress: string | null, isContractInitialized: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!walletAddress || !isContractInitialized) {
      return;
    }

    // Setup event listeners
    contractService.setupEventListeners(walletAddress, {
      onGameStarted: (gameId: string, bet: string) => {
        console.log('Game started:', { gameId, bet });
        // Game state will be updated through periodic polling or direct calls
      },

      onCardDealt: (gameId: string, suit: number, value: number, isDealer: boolean) => {
        console.log('Card dealt:', { gameId, suit, value, isDealer });
        dispatch(addCardFromEvent({
          card: { suit, value },
          isDealer,
          gameId
        }));
      },

      onPlayerAction: (gameId: string, action: string) => {
        console.log('Player action:', { gameId, action });
        // Actions are handled through the UI, this is mainly for logging
      },

      onGameEnded: (gameId: string, result: number, payout: string) => {
        console.log('Game ended:', { gameId, result, payout });
        dispatch(gameEndedFromEvent({
          gameId,
          result: result as GameResult,
          payout
        }));
      },

      onStatsUpdated: (wins: string, losses: string, streak: string) => {
        console.log('Stats updated:', { wins, losses, streak });
        // We could update individual stats here, but it's better to refetch all stats
        // to ensure consistency
      }
    });

    // Cleanup function
    return () => {
      contractService.removeAllListeners();
    };
  }, [walletAddress, isContractInitialized, dispatch]);
};