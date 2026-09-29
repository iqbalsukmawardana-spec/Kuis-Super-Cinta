# SPEC — Kuis "Seberapa Kamu Kenal Aku?" (birthday surprise quiz, id-ID)

Mobile-first (portrait, max-w-md) surprise quiz web app in Indonesian. One link, no
accounts, no personal data stored. Flow: **Gate → Quiz (8 MCQ) → Score/Title → Reward → Replay**.

## Flow & behavior
1. **Gate** (`GateScreen`): secret word input. Secret = **`Sovers`** (case-insensitive, trimmed).
   Server-verified via `POST /api/quiz/unlock` (403 on wrong word → playful error + shake).
   Wrong attempts never block; hint toggle available (`gate-hint-toggle`).
2. **Quiz** (`QuizScreen`): 8 multiple-choice questions, instant feedback. Correct → heart burst
   + synth chime + score++. Wrong → playful tease + fun-fact reveal; never punitive, always advances.
   Progress bar, step counter, score badge. Feedback sheet is sticky-bottom with a Next button.
3. **Score** (`ScoreScreen`): animated 0→score ticker + tier from `config.titles`
   (7–8 "Soulmate Sejati", 5–6 "Pacar Idaman", 0–4 "Wajib Kencan Lagi"). Every path leads to reward.
4. **Reward** (`RewardScreen`): wax-seal envelope → tap "Buka Surat Cinta" → flap animation →
   letter (parchment, Lora serif) + polaroid photo slider (scroll-snap, tap-to-zoom dialog,
   lazy images) + voice-note player (strictly tap-to-play, animated waveform, timer; mp3 for
   iOS Safari) + Replay button (resets quiz, skips gate — already unlocked).

## Data model (MongoDB, db `app`)
- `quiz_config` — single doc `id: "main"`: `secret_word`, `gate_active`, `gate_hint`,
  `audio_url`, `hero_image_url`, `letter {title,greeting,body,signoff}`,
  `titles [{min_score,max_score,emoji,title,message}]`, `photos [{url,caption,date_label}]`.
- `quiz_questions` — 8 docs: `id` (q1..q8), `order`, `question`, `options[]`, `correct_index`, `fun_fact`.
- Edit content by editing those collections (Compass/shell) or via `PUT /api/quiz/content`
  (authorized by current `secret_word`). Reseed an EMPTY db: `cd /app/backend && python seed.py` (idempotent).

## API (all under `/api`, defined in backend/routers/quiz.py)
- `GET /api/quiz/meta` → `{gate_active, gate_hint, ready}` — no answers, no letter.
- `POST /api/quiz/unlock` `{secret_word}` → 200 full `QuizContent{questions[], config}` |
  403 wrong word | 404 not seeded.
- `PATCH /api/quiz/content` `{secret_word, config?{…partial…}, questions?}` → **partial edit**:
  send only the fields you want to change (e.g. just `config.letter`, just `config.photos`,
  or `config.secret_word` to change the gate word). Returns updated `QuizContent`.
- `PUT /api/quiz/content` `{secret_word, config?, questions?}` → full replace of config/questions.
- Legacy template routes `POST/GET /api/status` still exist (unused by the app).

## Frontend
- `src/pages/Home.tsx` phases gate→quiz→score→reward (AnimatePresence); content falls back to
  `DEFAULT_CONTENT` in `src/lib/types.ts` when the backend is unreachable (static preview) —
  gate then checks the secret client-side so the flow never dies.
- Types in `src/lib/types.ts` mirror `backend/models/quiz.py` — keep in sync.
- sfx: Web Audio synth (`src/lib/sfx.ts`); animations: motion; fonts: Lora Variable (headings) +
  Plus Jakarta Sans (body); theme tokens in `src/index.css`.

## No credentials/accounts
No login. The only secret is the gate word **`Sovers`** (also in `memory/test_credentials.md`).
