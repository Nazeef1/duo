// Speech synthesis client using Web Speech API to read Spanish prompts aloud.
// Automatically attempts to find and load a native Spanish speaker voice.

export const speech = {
  speak: (text: string, lang?: 'es' | 'en') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Determine language: explicit or auto-detected
    let targetLang = lang;
    if (!targetLang) {
      const hasSpanishChars = /[¿¡ñáéíóúü]/i.test(text);
      const isEnglishInstruction = /choose|translation|translate|match|type|select|write/i.test(text);
      targetLang = (hasSpanishChars || !isEnglishInstruction) ? 'es' : 'en';
    }

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang || 'es'));
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    // Set parameters
    utterance.lang = targetLang === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = targetLang === 'es' ? 0.85 : 1.0; // Slightly slower for Spanish learning clarity
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }
};
