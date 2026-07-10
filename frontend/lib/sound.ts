// Plays actual downloaded Duolingo sound chimes (MP3s)
// Checks Zustand store configuration to enforce sound preferences

import { useUserStore } from '@/store/useUserStore';

export const sound = {
  playCorrect: () => {
    const enabled = useUserStore.getState().soundEffectsEnabled;
    if (!enabled) return;
    try {
      const audio = new Audio('/sounds/Correct answer sound effect.mp3');
      audio.volume = 0.45;
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));
    } catch (e) {
      console.error("Audio error", e);
    }
  },

  playIncorrect: () => {
    const enabled = useUserStore.getState().soundEffectsEnabled;
    if (!enabled) return;
    try {
      const audio = new Audio('/sounds/Duolingo Wrong.mp3');
      audio.volume = 0.45;
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));
    } catch (e) {
      console.error("Audio error", e);
    }
  },

  playComplete: () => {
    const enabled = useUserStore.getState().soundEffectsEnabled;
    if (!enabled) return;
    try {
      const audio = new Audio('/sounds/Level complete.mp3');
      audio.volume = 0.45;
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));
    } catch (e) {
      console.error("Audio error", e);
    }
  }
};
