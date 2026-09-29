import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

interface VoiceNotePlayerProps {
  url: string;
}

interface AudioCallbacks {
  onTime: (seconds: number) => void;
  onMeta: (duration: number) => void;
  onEnd: () => void;
  onError: () => void;
}

function createAudio(url: string, cb: AudioCallbacks): HTMLAudioElement {
  const a = new Audio(url);
  a.preload = "metadata";
  a.addEventListener("timeupdate", () => cb.onTime(a.currentTime));
  a.addEventListener("loadedmetadata", () => cb.onMeta(a.duration || 0));
  a.addEventListener("durationchange", () => cb.onMeta(a.duration || 0));
  a.addEventListener("ended", () => cb.onEnd());
  a.addEventListener("error", () => cb.onError());
  return a;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const BAR_HEIGHTS = [10, 18, 26, 32, 26, 20, 28, 16, 10];

// Strictly tap-to-play (iOS Safari blocks autoplay) — with an animated waveform while playing.
export function VoiceNotePlayer({ url }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  const toggle = () => {
    if (failed || !url) return;
    if (!audioRef.current) {
      audioRef.current = createAudio(url, {
        onTime: setCurrent,
        onMeta: setDuration,
        onEnd: () => {
          setPlaying(false);
          setCurrent(0);
        },
        onError: () => {
          setFailed(true);
          setPlaying(false);
        },
      });
    }
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setFailed(true));
      setPlaying(true);
    }
  };

  return (
    <div
      className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm"
      data-testid="voice-note-player"
    >
      <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
        Pesan suara dari akuu 🎙️
      </p>

      {failed || !url ? (
        <p className="mt-3 text-sm text-[#8A5A5A]" data-testid="voice-note-error">
          Audionya belum tersedia nih — tapi perasaanku udah sampai kok 💛
        </p>
      ) : (
        <div className="mt-3">
          <div className="flex h-9 items-end justify-center gap-1" data-testid="voice-note-waveform">
            {BAR_HEIGHTS.map((h, i) =>
              playing && !reduced ? (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-rose-500"
                  style={{ height: h }}
                  animate={{ scaleY: [0.35, 1, 0.55, 1, 0.35] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.09 }}
                />
              ) : (
                <span
                  key={i}
                  className={`w-1 rounded-full ${playing ? "bg-rose-500" : "bg-rose-200"}`}
                  style={{ height: h * 0.5 }}
                />
              ),
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs tabular-nums text-[#8A5A5A]">
            <span data-testid="voice-note-time">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <span>{playing ? "sedang diputar…" : "ketuk tombol untuk putar"}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={playing ? "playing" : "paused"}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                data-testid={playing ? "pause-voice-note" : "play-voice-note"}
                onClick={toggle}
                className="mt-3 h-12 w-full rounded-2xl bg-[#E63956] text-base font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
              >
                {playing ? "Jeda ⏸" : "Play Pesan Suara ▶︎"}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
