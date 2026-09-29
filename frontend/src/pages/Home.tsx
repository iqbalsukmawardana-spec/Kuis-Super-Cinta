import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { DEFAULT_CONTENT, type QuizContent, type QuizMeta } from "@/lib/types";
import { playCorrect } from "@/lib/sfx";
import { GateScreen } from "@/components/GateScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ScoreScreen } from "@/components/ScoreScreen";
import { RewardScreen } from "@/components/RewardScreen";
import { Toaster } from "@/components/ui/sonner";

type Phase = "gate" | "quiz" | "score" | "reward";

const phaseMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export default function Home() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [content, setContent] = useState<QuizContent | null>(null);
  const [score, setScore] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const reduced = useReducedMotion();

  const { data: meta } = useQuery<QuizMeta>({
    queryKey: ["quiz-meta"],
    queryFn: () => apiGet<QuizMeta>("/quiz/meta"),
    retry: false,
  });

  const handleUnlock = useCallback(async (word: string): Promise<string | null> => {
    setUnlocking(true);
    try {
      const data = await apiPost<QuizContent>("/quiz/unlock", { secret_word: word });
      setContent(data);
      setPhase("quiz");
      playCorrect();
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        return "Ups, bukan kata itu 😜 Coba lagi ya!";
      }
      // Backend unreachable (e.g. static preview) — fall back to the bundled content.
      const guess = word.trim().toLowerCase();
      const secret = DEFAULT_CONTENT.config.secret_word.trim().toLowerCase();
      if (guess === secret) {
        setContent(DEFAULT_CONTENT);
        setPhase("quiz");
        return null;
      }
      return "Eyy coba baca hint.. 💕";
    } finally {
      setUnlocking(false);
    }
  }, []);

  // Gate disabled in content → walk straight into the quiz, no user action needed.
  useEffect(() => {
    if (meta && !meta.gate_active && !content && !unlocking) void handleUnlock("");
  }, [meta, content, unlocking, handleUnlock]);

  const completeQuiz = (finalScore: number) => {
    setScore(finalScore);
    setPhase("score");
  };

  const replay = () => {
    setScore(0);
    setRunKey((k) => k + 1);
    setPhase("quiz");
    toast.success("Kuis diulang dari awal! Semangat ya 💪");
  };

  return (
    <div className="min-h-svh bg-[#fff8f6]">
      <Toaster />
      <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col overflow-hidden bg-[#fff8f6] sm:my-4 sm:rounded-3xl sm:border sm:border-rose-100 sm:shadow-xl">
        <AnimatePresence mode="wait">
          {phase === "gate" ? (
            <motion.div key="gate" {...(reduced ? { transition: phaseMotion.transition } : phaseMotion)}>
              <GateScreen gateHint={meta?.gate_hint ?? ""} unlocking={unlocking} onUnlock={handleUnlock} />
            </motion.div>
          ) : null}

          {phase === "quiz" && content ? (
            <motion.div
              key={`quiz-${runKey}`}
              {...(reduced ? { transition: phaseMotion.transition } : phaseMotion)}
            >
              <QuizScreen content={content} onComplete={completeQuiz} />
            </motion.div>
          ) : null}

          {phase === "score" && content ? (
            <motion.div key="score" {...(reduced ? { transition: phaseMotion.transition } : phaseMotion)}>
              <ScoreScreen
                score={score}
                total={content.questions.length}
                titles={content.config.titles}
                onOpenReward={() => setPhase("reward")}
              />
            </motion.div>
          ) : null}

          {phase === "reward" && content ? (
            <motion.div key="reward" {...(reduced ? { transition: phaseMotion.transition } : phaseMotion)}>
              <RewardScreen content={content} onReplay={replay} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
