// One-shot heart/confetti burst overlay. Increment `burstKey` to fire a new burst.
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const GLYPHS = ["❤️", "💖", "💕", "✨", "💘", "💗"];
const PARTICLE_COUNT = 16;

interface Particle {
  dx: number;
  dy: number;
  rotate: number;
  scale: number;
  glyph: string;
  duration: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.8;
    const dist = 70 + Math.random() * 90;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 40,
      rotate: (Math.random() - 0.5) * 140,
      scale: 0.8 + Math.random() * 1.3,
      glyph: GLYPHS[i % GLYPHS.length],
      duration: 0.9 + Math.random() * 0.5,
    };
  });
}

interface Burst {
  id: number;
  particles: Particle[];
}

export function HeartBurst({ burstKey }: { burstKey: number }) {
  const reduced = useReducedMotion();
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (!burstKey) return;
    const burst: Burst = { id: burstKey, particles: makeParticles() };
    setBursts((prev) => [...prev, burst]);
    const timer = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstKey));
    }, 1600);
    return () => clearTimeout(timer);
  }, [burstKey]);

  if (bursts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {bursts.map((burst) =>
        burst.particles.map((p, i) => (
          <motion.span
            key={`${burst.id}-${i}`}
            className="absolute left-1/2 top-1/2 text-2xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
            animate={
              reduced
                ? { opacity: 0, scale: 1.2 }
                : { x: p.dx, y: p.dy, rotate: p.rotate, scale: p.scale, opacity: 0 }
            }
            transition={{ duration: reduced ? 0.5 : p.duration, ease: "easeOut" }}
          >
            {p.glyph}
          </motion.span>
        )),
      )}
    </div>
  );
}
