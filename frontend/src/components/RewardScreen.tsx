import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { HeartBurst } from "@/components/HeartBurst";
import { FloatingHearts } from "@/components/FloatingHearts";
import { VoiceNotePlayer } from "@/components/VoiceNotePlayer";
import { playOpen } from "@/lib/sfx";
import type { MemoryPhoto, QuizContent } from "@/lib/types";

type EnvelopeStage = "closed" | "opening" | "open";

interface RewardScreenProps {
  content: QuizContent;
  onReplay: () => void;
}

function PhotoCard({
  photo,
  index,
  onZoom,
}: {
  photo: MemoryPhoto;
  index: number;
  onZoom: (photo: MemoryPhoto) => void;
}) {
  const tilt = index % 2 === 0 ? "-rotate-2" : "rotate-2";
  return (
    <figure
      className={`min-w-[240px] max-w-[240px] snap-center rounded-lg bg-white p-3 pb-3 shadow-lg ${tilt} transition-transform active:scale-[0.98]`}
      data-testid={`photo-${index}`}
      onClick={() => onZoom(photo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onZoom(photo)}
    >
      <img
        src={photo.url}
        alt={photo.caption || "Foto kenangan"}
        loading="lazy"
        className="h-44 w-full rounded-sm object-cover"
      />
      <figcaption className="mt-2 px-1 text-left">
        <p className="font-heading text-sm font-medium text-[#4A1A24]">{photo.caption}</p>
        {photo.date_label ? (
          <p className="mt-0.5 text-[11px] text-[#8A5A5A]">{photo.date_label}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function RewardScreen({ content, onReplay }: RewardScreenProps) {
  const { config, } = content;
  const [stage, setStage] = useState<EnvelopeStage>("closed");
  const [burst, setBurst] = useState(0);
  const [zoomed, setZoomed] = useState<MemoryPhoto | null>(null);
  const reduced = useReducedMotion();

  const openEnvelope = () => {
    if (stage !== "closed") return;
    playOpen();
    setBurst((b) => b + 1);
    setStage("opening");
    window.setTimeout(() => setStage("open"), reduced ? 0 : 650);
  };

  return (
    <div className="relative flex min-h-svh flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <FloatingHearts count={5} />
      <HeartBurst burstKey={burst} />

      <div className="relative z-10 mx-auto w-full max-w-sm">
        <AnimatePresence mode="wait">
          {stage !== "open" ? (
            <motion.div
              key="envelope"
              exit={{ opacity: 0, y: -20 }}
              className="mt-10 flex flex-col items-center"
            >
              <p className="text-center text-sm text-[#8A5A5A]">
                Ada sesuatu yang nungguin kamu di sini…
              </p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mt-6 w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-2xl"
                style={{ perspective: 800 }}
                data-testid="reward-envelope"
              >
                <div className="flex h-56 flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="text-4xl">💌</span>
                  <p className="font-heading text-lg font-semibold text-white">
                    Ada surat untukmu…
                  </p>
                  <p className="text-xs text-rose-100">dari yang paling sayang kamu</p>
                </div>

                {/* flap */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-rose-300 to-rose-400"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    transformOrigin: "top center",
                    backfaceVisibility: "hidden",
                  }}
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: stage === "closed" ? 0 : -180 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />

                {/* wax seal */}
                <motion.div
                  className="absolute left-1/2 top-16 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-rose-600 text-xl shadow-lg ring-4 ring-rose-200"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: stage === "closed" ? 1 : 0, opacity: stage === "closed" ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: "easeIn" }}
                >
                  ❤️
                </motion.div>
              </motion.div>

              <Button
                data-testid="open-letter-btn"
                onClick={openEnvelope}
                disabled={stage === "opening"}
                className="mt-6 h-13 w-full max-w-xs rounded-2xl bg-[#E63956] py-4 text-base font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
              >
                {stage === "opening" ? "Membukanya…" : "Buka Surat Cinta 💌"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="reward-content"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mt-4 space-y-6"
              data-testid="reward-content"
            >
              {/* the letter */}
              <section
                className="rounded-3xl border border-amber-100 bg-[#FAF5EE] p-6 shadow-md"
                data-testid="letter-content"
              >
                <h2 className="text-center font-heading text-xl font-semibold text-[#382419]">
                  {config.letter.title}
                </h2>
                <div className="my-4 flex justify-center">
                  <span className="h-px w-16 bg-rose-200" />
                </div>
                <p className="font-heading text-base italic text-[#382419]">
                  {config.letter.greeting}
                </p>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#4a3226]">
                  {config.letter.body}
                </p>
                <p className="mt-5 whitespace-pre-line text-right font-heading text-sm italic text-[#735341]">
                  {config.letter.signoff}
                </p>
              </section>

              {/* memories slider */}
              <section data-testid="memories-section">
                <h3 className="font-heading text-lg font-semibold text-[#4A1A24]">
                  Kenangan kita 📸
                </h3>
                <p className="mt-0.5 text-xs text-[#8A5A5A]">Geser buat lihat semuanya →</p>
                <div
                  className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3"
                  data-testid="photo-slider"
                >
                  {config.photos.map((photo, i) => (
                    <PhotoCard key={i} photo={photo} index={i} onZoom={setZoomed} />
                  ))}
                </div>
              </section>

              {/* voice note */}
              <VoiceNotePlayer url={config.audio_url} />

              <section className="pb-4 text-center">
                <p className="text-sm text-[#8A5A5A]">
                  Terima kasih udah main sampai sini sayang. Nanti tunggu ya ada hadiah lagii.. Selamat ulang tahun My Beybie! 🎂❤️
                </p>
                <Button
                  data-testid="replay-btn"
                  onClick={onReplay}
                  variant="outline"
                  className="mt-4 h-11 w-full rounded-2xl border-rose-200 text-rose-600"
                >
                  Ulangi Kuis 🔄
                </Button>
                <p className="mt-6 text-[11px] text-[#c99aa5]">
                  dibuat dengan penuh ❤️ khusus untuk kamu
                </p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* tap-to-zoom photo dialog */}
      <Dialog open={zoomed !== null} onOpenChange={(open) => !open && setZoomed(null)}>
        <DialogContent className="w-[92vw] max-w-sm rounded-2xl p-3" data-testid="photo-zoom-dialog">
          {zoomed ? (
            <div>
              <img
                src={zoomed.url}
                alt={zoomed.caption || "Foto kenangan"}
                className="max-h-[65vh] w-full rounded-lg object-cover"
              />
              <DialogTitle className="mt-2 px-1 text-center font-heading text-sm font-medium text-[#4A1A24]">
                {zoomed.caption}
              </DialogTitle>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
