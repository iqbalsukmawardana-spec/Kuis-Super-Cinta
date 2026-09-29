import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeartBurst } from "@/components/HeartBurst";
import { FloatingHearts } from "@/components/FloatingHearts";
import { playCelebrate } from "@/lib/sfx";
import { titleForScore, type TitleTier } from "@/lib/types";

interface ScoreScreenProps {
  score: number;
  total: number;
  titles: TitleTier[];
  onOpenReward: () => void;
}

export function ScoreScreen({ score, total, titles, onOpenReward }: ScoreScreenProps) {
  const tier = titleForScore(titles, score);
  const [display, setDisplay] = useState(0);
  const [burst, setBurst] = useState(0);
  const celebrated = useRef(false);
  const reduced = useReducedMotion();

  // Celebrate once — the ref guard keeps StrictMode's double effect from doubling the sound.
  useEffect(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    playCelebrate();
    setBurst((b) => b + 1);
  }, []);

  // Animated score ticker 0 → score.
  useEffect(() => {
    if (reduced) {
      setDisplay(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(Math.round(p * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, reduced]);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6 py-8 text-center">
      <FloatingHearts count={6} />
      <HeartBurst burstKey={burst} />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="text-7xl"
          data-testid="score-emoji"
        >
          {tier?.emoji ?? "💖"}
        </motion.div>

        <p className="mt-6 text-sm text-[#8A5A5A]">
          Kamu menjawab <span className="font-bold text-[#E63956]" data-testid="score-counter">{display}</span>{" "}
          dari {total} soal dengan benar!
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
          className="mt-5 rounded-3xl border border-rose-100 bg-[#FFF0F2] p-6 shadow-sm"
          data-testid="score-title-card"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
            Gelar kamu
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-[#4A1A24]" data-testid="score-title">
            {tier?.title ?? "Pacar Spesial"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#8A5A5A]" data-testid="score-message">
            {tier?.message ?? "Kamu tetap yang paling spesial 💖"}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-sm leading-relaxed text-[#8A5A5A]"
        >
          Apapun skornya, kamu tetap yang paling spesial xixii. Sekarang, saatnya buka
          hadiah kamuu..
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6"
        >
          <Button
            data-testid="open-reward-btn"
            onClick={onOpenReward}
            className="h-13 w-full rounded-2xl bg-[#E63956] px-6 py-4 text-base font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
          >
            Buka Hadiah Spesialmu 🎁
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
