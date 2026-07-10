// Speech synthesis client using Web Speech API to read Spanish prompts aloud.
// Automatically attempts to find and load a native Spanish speaker voice.

export const speech = {
  speak: (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    
    if (esVoice) {
      utterance.voice = esVoice;
    }
    
    // Set parameters
    utterance.lang = 'es-ES';
    utterance.rate = 0.85; // Slightly slower for better learning clarity, similar to Duolingo
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }
};
