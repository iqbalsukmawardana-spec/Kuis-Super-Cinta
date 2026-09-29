import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeartBurst } from "@/components/HeartBurst";
import { playCorrect, playWrong } from "@/lib/sfx";
import type { QuizContent } from "@/lib/types";

const PRAISE = [
  "Woww, bener kamu nihh! 🥳",
  "Ahayy keyen oyy benerr! 💘",
  "Xixii benel lagii! 💖",
  "Yahuuu perfect nian oiyy! ✨",
];

const TEASE = [
  "Eits, hampirr niaan! 😜",
  "Salah sikitt, takpaa 💗",
  "Wadaw, kena jebakan kamu nihh 😆",
  "Huhuu beyum beneer 💔",
];

const LETTERS = ["A", "B", "C", "D", "E"];

interface QuizScreenProps {
  content: QuizContent;
  onComplete: (score: number) => void;
}

export function QuizScreen({ content, onComplete }: QuizScreenProps) {
  const questions = content.questions;
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [burst, setBurst] = useState(0);
  const reduced = useReducedMotion();

  const question = questions[index];
  const answered = selected !== null;
  const isCorrect = answered && selected === question.correct_index;
  const isLast = index + 1 >= total;
  const progress = ((index + (answered ? 1 : 0)) / Math.max(total, 1)) * 100;

  // Keep the feedback sheet in view once it appears.
  useEffect(() => {
    if (answered) window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [answered, index]);

  if (total === 0) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6 text-center">
        <p className="text-sm text-[#8A5A5A]">
          Soalnya belum diisi nih — jalankan seed di backend dulu ya 🙈
        </p>
      </div>
    );
  }

  const choose = (optionIndex: number) => {
    if (answered) return;
    setSelected(optionIndex);
    if (optionIndex === question.correct_index) {
      setScore((s) => s + 1);
      setBurst((b) => b + 1);
      playCorrect();
    } else {
      playWrong();
    }
  };

  const next = () => {
    if (isLast) {
      onComplete(score);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const optionClass = (i: number): string => {
    const base =
      "flex min-h-12 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left shadow-sm transition-all active:scale-[0.98]";
    if (!answered) return `${base} border-rose-100 bg-white hover:border-rose-300`;
    if (i === question.correct_index) return `${base} border-emerald-400 bg-emerald-50 text-emerald-900`;
    if (i === selected) return `${base} border-amber-400 bg-amber-50 text-amber-900`;
    return `${base} border-rose-100 bg-white opacity-50`;
  };

  const badgeClass = (i: number): string => {
    const base = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold";
    if (!answered) return `${base} bg-rose-100 text-rose-600`;
    if (i === question.correct_index) return `${base} bg-emerald-200 text-emerald-800`;
    if (i === selected) return `${base} bg-amber-200 text-amber-800`;
    return `${base} bg-rose-50 text-rose-300`;
  };

  return (
    <div className="relative flex min-h-svh flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <HeartBurst burstKey={burst} />

      <div className="relative z-10" data-testid="quiz-topbar">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#4A1A24]" data-testid="quiz-step">
            Soal {index + 1} dari {total}
          </span>
          <span
            className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700"
            data-testid="quiz-score-badge"
          >
            ❤️ Skor {score}
          </span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-rose-100"
          data-testid="quiz-progress-bar"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="relative z-10 mt-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="rounded-3xl border border-rose-100 bg-[#FFF0F2] p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
                Pertanyaan {index + 1}
              </p>
              <h2
                className="mt-2 font-heading text-xl font-semibold leading-snug text-[#4A1A24]"
                data-testid="quiz-question"
              >
                {question.question}
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  data-testid={`quiz-option-${i}`}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={optionClass(i)}
                >
                  <span className={badgeClass(i)}>{LETTERS[i]}</span>
                  <span className="flex-1 text-sm font-medium leading-snug">{option}</span>
                  {answered && i === question.correct_index ? (
                    <span className="text-emerald-600">✓</span>
                  ) : answered && i === selected ? (
                    <span className="text-amber-600">✗</span>
                  ) : null}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {answered ? (
          <motion.div
            key="feedback"
            initial={reduced ? { opacity: 0 } : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="sticky bottom-3 z-10 mt-6"
            data-testid="quiz-feedback-sheet"
          >
            <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-xl">
              <p
                className={`font-heading text-lg font-semibold ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}
                data-testid="feedback-title"
              >
                {isCorrect ? PRAISE[index % PRAISE.length] : TEASE[index % TEASE.length]}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#7A4D4D]" data-testid="feedback-body">
                {isCorrect ? "Memang paling keren xixii! 🎉" : `Faktanya: ${question.fun_fact}`}
              </p>
              <Button
                data-testid="next-question-btn"
                onClick={next}
                className="mt-4 h-12 w-full rounded-2xl bg-[#E63956] text-base font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
              >
                {isLast ? "Lihat Hasilmu 🎉" : "Lanjuttt.. ➡️"}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
