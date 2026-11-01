/**
 * ChaarChal audio + haptics.
 * Sounds are synthesised with the Web Audio API so the game ships with zero
 * binary assets and works fully offline.
 */

export type SoundName =
  | "roll"
  | "land"
  | "capture"
  | "home"
  | "turn"
  | "win"
  | "click"
  | "error";

interface Tone {
  freq: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  delay: number;
}

const RECIPES: Record<SoundName, Tone[]> = {
  roll: [
    { freq: 220, duration: 0.05, type: "square", gain: 0.16, delay: 0 },
    { freq: 180, duration: 0.05, type: "square", gain: 0.14, delay: 0.07 },
    { freq: 260, duration: 0.05, type: "square", gain: 0.12, delay: 0.14 },
    { freq: 200, duration: 0.06, type: "square", gain: 0.1, delay: 0.21 },
  ],
  land: [{ freq: 520, duration: 0.08, type: "triangle", gain: 0.18, delay: 0 }],
  capture: [
    { freq: 320, duration: 0.1, type: "sawtooth", gain: 0.16, delay: 0 },
    { freq: 160, duration: 0.18, type: "sawtooth", gain: 0.14, delay: 0.06 },
  ],
  home: [
    { freq: 660, duration: 0.1, type: "sine", gain: 0.2, delay: 0 },
    { freq: 880, duration: 0.14, type: "sine", gain: 0.18, delay: 0.1 },
  ],
  turn: [{ freq: 440, duration: 0.06, type: "sine", gain: 0.12, delay: 0 }],
  win: [
    { freq: 523, duration: 0.14, type: "triangle", gain: 0.2, delay: 0 },
    { freq: 659, duration: 0.14, type: "triangle", gain: 0.2, delay: 0.14 },
    { freq: 784, duration: 0.16, type: "triangle", gain: 0.2, delay: 0.28 },
    { freq: 1046, duration: 0.3, type: "triangle", gain: 0.2, delay: 0.44 },
  ],
  click: [{ freq: 720, duration: 0.04, type: "sine", gain: 0.12, delay: 0 }],
  error: [{ freq: 180, duration: 0.12, type: "square", gain: 0.12, delay: 0 }],
};

let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.6;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function configureAudio(nextEnabled: boolean, nextVolume: number): void {
  enabled = nextEnabled;
  volume = Math.max(0, Math.min(1, nextVolume));
}

export function primeAudio(): void {
  context();
}

export function playSound(name: SoundName): void {
  if (!enabled || volume <= 0) return;
  const audio = context();
  if (!audio) return;
  const now = audio.currentTime;
  for (const tone of RECIPES[name]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.freq, now + tone.delay);
    gain.gain.setValueAtTime(0.0001, now + tone.delay);
    gain.gain.exponentialRampToValueAtTime(tone.gain * volume, now + tone.delay + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.delay + tone.duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now + tone.delay);
    osc.stop(now + tone.delay + tone.duration + 0.02);
  }
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* haptics are best-effort */
  }
}
