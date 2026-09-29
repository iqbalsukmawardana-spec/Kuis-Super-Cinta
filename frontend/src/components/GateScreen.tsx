import { useState } from "react";
import type { FormEvent } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingHearts } from "@/components/FloatingHearts";

interface GateScreenProps {
  gateHint: string;
  unlocking: boolean;
  onUnlock: (word: string) => Promise<string | null>;
}

export function GateScreen({ gateHint, unlocking, onUnlock }: GateScreenProps) {
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const controls = useAnimationControls();
  const reduced = useReducedMotion();

  const fail = (message: string) => {
    setError(message);
    if (!reduced) void controls.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.45 } });
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (unlocking) return;
    const message = await onUnlock(word);
    if (message) fail(message);
  };

  return (
    <div className="relative flex min-h-svh flex-col justify-center px-5 py-8">
      <FloatingHearts count={9} />

      <div className="relative z-10 mx-auto w-full max-w-sm text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 to-rose-300 shadow-inner">
            <motion.span
              className="text-5xl"
              animate={reduced ? {} : { scale: [1, 1.12, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              💌
            </motion.span>
          </div>

          <p className="mt-5 inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700">
            Spesial Ulang Tahun Sovers ❤️
          </p>

          <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-[#4A1A24]">
            Seberapa Kamu Kenal Hubungan Kita Xixi!
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#8A5A5A]">
            Hi Bibeyy! Sebelum masuk ke kejutan spesial, buktiin kalo ini beneran kamu nyakk 🤭
          </p>
        </motion.div>

        <form
          onSubmit={(event) => void submit(event)}
          className="mt-8 space-y-4 text-left"
          data-testid="gate-form"
        >
          <motion.div animate={controls}>
            <Input
              data-testid="gate-input"
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ketik kata rahasia… 🫢"
              aria-label="Kata rahasia"
              autoCapitalize="none"
              autoComplete="off"
              className="h-12 rounded-2xl border-rose-200 bg-white/90 text-center text-base shadow-sm"
            />
          </motion.div>

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-medium text-[#B82E3E]"
              data-testid="gate-error"
              role="alert"
            >
              {error}
            </motion.p>
          ) : null}

          <Button
            type="submit"
            data-testid="gate-submit"
            disabled={unlocking}
            className="h-12 w-full rounded-2xl bg-[#E63956] text-base font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
          >
            {unlocking ? "Sebentaaar…" : "Buka Gerbang Cinta ✨"}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            data-testid="gate-hint-toggle"
            onClick={() => setShowHint((s) => !s)}
            className="text-xs font-medium text-rose-500 underline underline-offset-4"
          >
            {showHint ? "Tutup hint" : "Butuh hint takk? 💡"}
          </button>
          {showHint ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mx-auto mt-2 max-w-xs text-xs text-[#8A5A5A]"
              data-testid="gate-hint"
            >
              Hint: {gateHint || "Kata panggilan untuk fans kamu pas udah jadi artis 🤭💖"}
            </motion.p>
          ) : null}
        </div>
      </div>

      <p className="relative z-10 mt-10 text-center text-[11px] text-[#c99aa5]">
        dibuat dengan penuh ❤️ khusus buat dedekk 🤪
      </p>
    </div>
  );
}
