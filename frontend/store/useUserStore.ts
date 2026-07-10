import { create } from 'zustand';
import { api } from '../lib/api';

interface UserState {
  username: string;
  hearts: number;
  gems: number;
  xp: number;
  streak: number;
  dailyGoal: number;
  currentAttemptId: number | null;
  isLoading: boolean;
  error: string | null;

  fetchUser: () => Promise<void>;
  refillHearts: () => Promise<void>;
  setAttemptId: (id: number | null) => void;
  optimisticHeartsDecrement: () => void;
  reconcileHearts: (hearts: number) => void;
  updateLocalStats: (updates: { xp_earned?: number; streak?: number }) => void;
  updateDailyGoal: (goal: number) => void;
  updateUsername: (name: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: 'learner',
  hearts: 5,
  gems: 500,
  xp: 0,
  streak: 0,
  dailyGoal: 30,
  currentAttemptId: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.getProfile();
      set({
        username: profile.username,
        hearts: profile.hearts,
        gems: profile.gems,
        xp: profile.total_xp,
        streak: profile.streak,
        dailyGoal: profile.daily_xp_goal,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  refillHearts: async () => {
    try {
      const response = await api.refillHearts();
      set({ hearts: response.hearts });
    } catch (err: any) {
      set({ error: err.message || 'Failed to refill hearts' });
    }
  },

  setAttemptId: (id) => set({ currentAttemptId: id }),

  optimisticHeartsDecrement: () => set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),

  reconcileHearts: (hearts) => set({ hearts }),

  updateLocalStats: (updates) => set((state) => ({
    xp: state.xp + (updates.xp_earned || 0),
    streak: updates.streak !== undefined ? updates.streak : state.streak
  })),

  updateDailyGoal: (goal) => set({ dailyGoal: goal }),

  updateUsername: (name) => set({ username: name })
}));
