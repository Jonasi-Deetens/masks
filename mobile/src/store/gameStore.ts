import { create } from 'zustand';

interface PlayerState {
  id: string | null;
  username: string;
  energy: number;
  mood: string;
  time: string;
  reputation: number;
  currentMaskId: string | null;
  zoneId: string | null;
}

interface GameStore {
  player: PlayerState | null;
  isLoading: boolean;
  
  // Actions
  setPlayer: (player: PlayerState | null) => void;
  updatePlayerStats: (stats: Partial<PlayerState>) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  player: null,
  isLoading: false,

  setPlayer: (player) => set({ player }),
  
  updatePlayerStats: (stats) => set((state) => ({
    player: state.player ? { ...state.player, ...stats } : null,
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  resetGame: () => set({ player: null, isLoading: false }),
}));

