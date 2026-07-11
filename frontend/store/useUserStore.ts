import { create } from 'zustand';
import { api } from '../lib/api';

interface UserState {
  username: string;
  hearts: number;
  gems: number;
  xp: number;
  streak: number;
  dailyGoal: number;
  openedChests: string[];
  currentAttemptId: number | null;
  isLoading: boolean;
  error: string | null;

  // Gamification & Settings Preferences
  soundEffectsEnabled: boolean;
  animationsEnabled: boolean;
  motivationalMessagesEnabled: boolean;
  theme: 'light' | 'dark' | 'system';

  fetchUser: () => Promise<void>;
  refillHearts: () => Promise<void>;
  setAttemptId: (id: number | null) => void;
  optimisticHeartsDecrement: () => void;
  reconcileHearts: (hearts: number) => void;
  updateLocalStats: (updates: { xp_earned?: number; streak?: number }) => void;
  updateDailyGoal: (goal: number) => void;
  updateUsername: (name: string) => void;
  openChest: (chestId: string) => Promise<void>;

  // Toggle Preferences Actions
  setSoundEffects: (enabled: boolean) => void;
  setAnimations: (enabled: boolean) => void;
  setMotivationalMessages: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loadPreferences: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  username: 'learner',
  hearts: 5,
  gems: 500,
  xp: 0,
  streak: 0,
  dailyGoal: 30,
  openedChests: [],
  currentAttemptId: null,
  isLoading: false,
  error: null,

  // Default preferences
  soundEffectsEnabled: true,
  animationsEnabled: true,
  motivationalMessagesEnabled: true,
  theme: 'dark',

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
        openedChests: profile.opened_chests || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  refillHearts: async () => {
    try {
      const response = await api.refillHearts();
      set({ hearts: response.hearts, gems: response.gems });
    } catch (err: any) {
      set({ error: err.message || 'Failed to refill hearts' });
      throw err;
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

  updateUsername: (name) => set({ username: name }),

  openChest: async (chestId) => {
    try {
      const res = await api.openChest(chestId);
      set((state) => ({
        gems: res.total_gems,
        openedChests: [...state.openedChests, chestId]
      }));
    } catch (err: any) {
      console.error('Failed to open chest:', err.message);
    }
  },

  // Toggle Preferences
  setSoundEffects: (enabled) => {
    localStorage.setItem('pref_sound_effects', JSON.stringify(enabled));
    set({ soundEffectsEnabled: enabled });
  },

  setAnimations: (enabled) => {
    localStorage.setItem('pref_animations', JSON.stringify(enabled));
    set({ animationsEnabled: enabled });
  },

  setMotivationalMessages: (enabled) => {
    localStorage.setItem('pref_motivational_messages', JSON.stringify(enabled));
    set({ motivationalMessagesEnabled: enabled });
  },

  setTheme: (theme) => {
    localStorage.setItem('pref_theme', theme);
    set({ theme });
    // Apply dataset attribute to document element for immediate CSS vars mapping
    if (typeof document !== 'undefined') {
      let activeTheme = theme;
      if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme === 'dark' ? 'dark' : 'light');
    }
  },

  loadPreferences: () => {
    if (typeof window === 'undefined') return;
    
    let soundEffectsEnabled = true;
    let animationsEnabled = true;
    let motivationalMessagesEnabled = true;

    try {
      const soundVal = localStorage.getItem('pref_sound_effects');
      if (soundVal !== null) soundEffectsEnabled = JSON.parse(soundVal);
    } catch (e) {
      console.warn("Failed to parse sound preferences, defaulting to true", e);
    }

    try {
      const animVal = localStorage.getItem('pref_animations');
      if (animVal !== null) animationsEnabled = JSON.parse(animVal);
    } catch (e) {
      console.warn("Failed to parse animation preferences, defaulting to true", e);
    }

    try {
      const motivVal = localStorage.getItem('pref_motivational_messages');
      if (motivVal !== null) motivationalMessagesEnabled = JSON.parse(motivVal);
    } catch (e) {
      console.warn("Failed to parse motivational preferences, defaulting to true", e);
    }

    set({
      soundEffectsEnabled,
      animationsEnabled,
      motivationalMessagesEnabled,
      theme: 'dark',
    });

    // Apply active theme immediately
    get().setTheme('dark');
  }
}));
