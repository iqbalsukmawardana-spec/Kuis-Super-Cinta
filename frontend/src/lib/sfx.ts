// Tiny Web Audio synth for the quiz sound effects — no external audio assets, and it
// unlocks cleanly on iOS Safari because every call originates from a user gesture.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12,
): void {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + startOffset;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch {
    // sound is decorative — never let it break the flow
  }
}

export function playCorrect(): void {
  tone(523.25, 0, 0.18, "sine", 0.12);
  tone(659.25, 0.09, 0.18, "sine", 0.12);
  tone(783.99, 0.18, 0.32, "sine", 0.12);
}

export function playWrong(): void {
  tone(311.13, 0, 0.2, "triangle", 0.1);
  tone(261.63, 0.12, 0.3, "triangle", 0.08);
}

export function playOpen(): void {
  tone(392, 0, 0.3, "sine", 0.1);
  tone(523.25, 0.12, 0.3, "sine", 0.1);
  tone(659.25, 0.24, 0.45, "sine", 0.1);
}

export function playCelebrate(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.35, "sine", 0.13));
}
