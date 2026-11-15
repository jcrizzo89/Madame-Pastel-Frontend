// Sistema de efectos sonoros nativos con Web Audio API para Madame Pastel
// Sin dependencias externas ni archivos pesados de red

let audioCtx = null;
let isMuted = false;

// Recuperar preferencia de sonido si existía
if (typeof window !== 'undefined') {
  try {
    isMuted = localStorage.getItem('madame_pastel_sound_muted') === 'true';
  } catch (e) {
    isMuted = false;
  }
}

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const getSoundMuted = () => isMuted;

export const toggleSoundMuted = () => {
  isMuted = !isMuted;
  try {
    localStorage.setItem('madame_pastel_sound_muted', String(isMuted));
  } catch (e) {
    // Ignore storage errors
  }
  return isMuted;
};

// Sonido pop percusivo y juguetón al soltar o añadir un topping
export const playToppingPop = (pitchFactor = 1) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 380 * pitchFactor;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    // Audio context safe fallback
  }
};

// Sonido dulce de burbuja/splash al cambiar de cobertura o piso
export const playColorSplash = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.18);
    });
  } catch (e) {}
};

// Sonido suave de eliminación de topping
export const playTrashSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {}
};

// Fanfarria festiva y mágica para el Veredicto de Madame Pastel
export const playFanfare = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Arpegio festivo: Do - Mi - Sol - Do(agudo) - Sol - Do final
    const notes = [
      { f: 523.25, t: 0.0, d: 0.14 }, // C5
      { f: 659.25, t: 0.12, d: 0.14 }, // E5
      { f: 783.99, t: 0.24, d: 0.16 }, // G5
      { f: 1046.5, t: 0.40, d: 0.35 }, // C6
      { f: 783.99, t: 0.65, d: 0.14 }, // G5
      { f: 1046.5, t: 0.78, d: 0.60 }  // C6 resonante
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.18, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  } catch (e) {}
};

// Sonido brillante y positivo de acierto en la Trivia
export const playCorrectChime = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { f: 587.33, t: 0.0, d: 0.12 }, // D5
      { f: 880.00, t: 0.09, d: 0.22 }  // A5
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.16, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.02);
    });
  } catch (e) {}
};

// Sonido suave y cálido de respuesta incorrecta o tiempo agotado
export const playIncorrectBuzz = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.22); // D3

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
};

// Click suave de advertencia de tiempo (últimos segundos)
export const playTimerTick = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {}
};

// Sonido de inicio de partida o nueva pregunta
export const playGameStartSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.16);
    });
  } catch (e) {}
};

// Sonido crujiente y mágico al abrir el Macaron de la Suerte
export const playMacaronCrackSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. "Crack" percusivo dulce
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(480, now);
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.08);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.11);

    // 2. Chime brillante que revela el pergamino (arpegio mágico F#5, A#5, C#6)
    const sparkleNotes = [739.99, 932.33, 1108.73];
    sparkleNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + 0.08 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.08 + idx * 0.05);
      osc.stop(now + 0.08 + idx * 0.05 + 0.36);
    });
  } catch (e) {}
};
