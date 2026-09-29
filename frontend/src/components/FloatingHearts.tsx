// Ambient floating hearts in the background — gentle, low-opacity, purely decorative.
import { motion, useReducedMotion } from "motion/react";

const HEARTS = ["❤️", "💕", "💖", "✨"];

export function FloatingHearts({ count = 8 }: { count?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className="absolute opacity-25"
          style={{ left: `${(i * 13 + 7) % 92}%`, fontSize: 14 + ((i * 7) % 18) }}
          initial={{ y: "105vh" }}
          animate={{ y: "-12vh", rotate: [0, 14, -10, 0] }}
          transition={{
            duration: 14 + (i % 5) * 3,
            repeat: Infinity,
            delay: i * 1.9,
            ease: "linear",
          }}
        >
          {HEARTS[i % HEARTS.length]}
        </motion.span>
      ))}
    </div>
  );
}
