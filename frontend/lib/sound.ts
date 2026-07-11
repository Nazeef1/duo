import { useUserStore } from '@/store/useUserStore';

const isSoundEnabled = (): boolean => {
  let enabled = useUserStore.getState().soundEffectsEnabled;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pref_sound_effects');
    if (stored !== null) {
      try {
        enabled = JSON.parse(stored);
      } catch (e) {
        enabled = true; // Default fallback on parse syntax errors
      }
    }
  }
  return enabled;
};

export const sound = {
  playCorrect: () => {
    if (!isSoundEnabled()) return;
    try {
      const audio = new Audio('/sounds/Correct answer sound effect.mp3');
      audio.volume = 0.45;
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));
    } catch (e) {
      console.error("Audio error", e);
    }
  },

  playIncorrect: () => {
    if (!isSoundEnabled()) return;
    try {
      const audio = new Audio('/sounds/Duolingo Wrong.mp3');
      audio.volume = 0.45;
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));
    } catch (e) {
      console.error("Audio error", e);
    }
  },

  playComplete: () => {
    if (!isSoundEnabled()) return;
    try {
      const audio = new Audio('/sounds/Level complete.mp3');
      audio.volume = 0.45;
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));
    } catch (e) {
      console.error("Audio error", e);
    }
  }
};
