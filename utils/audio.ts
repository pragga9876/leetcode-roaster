// Web Audio Synthesizer for tactile feedback
export function playCardSwish() {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // White noise buffer for swish sound
  const bufferSize = ctx.sampleRate * 0.15; // 150ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  whiteNoise.start();
}

export function playCardSlap() {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Low frequency thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

// Web Speech API Voice-Over
export function speakHinglishRoast(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Stop ongoing audio

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  // Priority: English (India) voices
  const indianVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
  if (indianVoice) {
    utterance.voice = indianVoice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
}