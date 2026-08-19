// Local Clean Meme Sound Effect
export function playCardSwish() {
  if (typeof window === 'undefined') return;

  const audio = new Audio('/fahhh.mp3');
  audio.volume = 0.9;

  // Play immediately
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('Audio playback blocked by browser interaction rules:', err);
    });
  }
}

// Slap sound trigger
export function playCardSlap() {
  if (typeof window === 'undefined') return;

  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

// Web Speech API Voice-Over
export function speakHinglishRoast(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  const indianVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
  if (indianVoice) {
    utterance.voice = indianVoice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
}