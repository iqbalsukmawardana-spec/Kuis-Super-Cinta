"""Seed the quiz content (idempotent). Run: cd /app/backend && python seed.py

All placeholder content lives here — edit it, re-run, or edit the documents directly in
MongoDB (collections: quiz_config, quiz_questions). Re-running never duplicates.
"""

import asyncio

from lib.db import client, db, ensure_indexes
from models.quiz import (
    LetterContent,
    MemoryPhoto,
    QuizConfig,
    QuizQuestion,
    TitleTier,
)

QUESTIONS = [
    QuizQuestion(
        id="q1",
        order=1,
        question="Makanan apa yang paling gak bisa aku tolak kalau lagi lapar tengah malam?",
        options=[
            "Mie instan kuah pedas + telur",
            "Martabak manis coklat keju",
            "Nasi goreng babat",
            "Ayam geprek level 10",
        ],
        correct_index=0,
        fun_fact="Mie instan kuah hangat pas malam dingin adalah kelemahan mutlakku! Apalagi kalau kamu yang masakin 🍜",
    ),
    QuizQuestion(
        id="q2",
        order=2,
        question="Kalau lagi jalan di mall, tempat yang pasti aku lirik apa nyakk?",
        options=[
            "Toko baju sama sepatu 🤔",
            "Gramed cari barang dan buku 😴",
            "Tempet ice cream / boba sedepp 🤤",
            "Bioskop dungg ajak kamu nontoon teyus 🤩",
        ],
        correct_index=2,
        fun_fact="Langsung peseenn chatime pake promo tiktok xixii! 🧋",
    ),
    QuizQuestion(
        id="q3",
        order=3,
        question="Apa hal kecil dari kamu yang paling sering bikin aku diam-diam senyum sendiri?",
        options=[
            "Pas kamu ketawa lepas sampai matanya menyipit",
            "Waktu kamu ngambek lucu minta dirayu",
            "Waktu kamu cerita hal random dengan antusias",
            "Semua hal di atas, tanpa terkecuali!",
        ],
        correct_index=3,
        fun_fact="Jawabannya pasti SEMUANYA! Tiap tingkah lucumu bikin hari-hariku jauh lebih berwarna 💖",
    ),
    QuizQuestion(
        id="q4",
        order=4,
        question="Warna apa yang menurutku paling cocok dan manis kalau kamu pakai?",
        options=[
            "Warna pastel / sage green",
            "Merah muda (pink)",
            "Hitam elegan",
            "Putih bersih",
        ],
        correct_index=1,
        fun_fact="Nuansa pink atau pastel selalu bikin kamu kelihatan paling imut & bersinar di mataku ✨",
    ),
    QuizQuestion(
        id="q5",
        order=5,
        question="Lagu apa yang liriknya selalu bikin aku ingat momen pertama kali kita dekat?",
        options=[
            "Hati-Hati di Jalan — Tulus",
            "Sempurna — Andra and The Backbone",
            "Komang — Raim Laode",
            "Kisah Romantis — Glenn Fredly",
        ],
        correct_index=2,
        fun_fact="Karena kamu adalah hal paling indah yang pernah hadir di hidupku, persis seperti lagu Komang 🎶",
    ),
    QuizQuestion(
        id="q6",
        order=6,
        question="Kalau lagi bad mood, obat paling ampuh buat balikin senyumku adalah?",
        options=[
            "Dikirimin pap muka lucu kamu",
            "Dipeluk & diajak makan enak",
            "Dengerin voice note kamu ketawa",
            "Semuanya, auto sembuh dalam sedetik",
        ],
        correct_index=3,
        fun_fact="Cukup dengar suaramu atau lihat foto senyummu, bad mood seharian langsung hilang seketika 🥰",
    ),
    QuizQuestion(
        id="q7",
        order=7,
        question="Kencan impian kita selanjutnya yang paling pengen kita wujudkan bareng?",
        options=[
            "Piknik santai di taman sore hari",
            "Road trip ke pantai sambil lihat sunset",
            "Glamping di pegunungan berkabut",
            "Staycation nonton film seharian",
        ],
        correct_index=1,
        fun_fact="Road trip lihat sunset di pantai bareng kamu adalah bucket list nomor satu kita! 🌅",
    ),
    QuizQuestion(
        id="q8",
        order=8,
        question="Harapan terbesarku untuk kamu di hari ulang tahun spesialmu ini adalah?",
        options=[
            "Selalu sehat dan bahagia setiap hari",
            "Semua impian dan cita-citamu tercapai",
            "Kita bisa terus bareng melewati tahun-tahun ke depan",
            "Semua doa baik di atas, dan cinta yang gak pernah habis!",
        ],
        correct_index=3,
        fun_fact="Selamat ulang tahun sayang! Aku bakal selalu ada buat dukung dan sayang kamu selamanya 🎉❤️",
    ),
]

CONFIG = QuizConfig(
    secret_word="Sovers",
    gate_active=True,
    gate_hint="Kata panggilan kesayangan kita 💖",
    # Placeholder voice note (mp3, aman untuk iOS Safari) — ganti dengan file suaramu
    # di object storage lewat MongoDB / PUT /api/quiz/content.
    audio_url="https://audio.jukehost.co.uk/01a0ec37-52d3-72e3-9848-d02ee3813dca",
    hero_image_url=(
        "https://images.unsplash.com/photo-1591969851586-adbbd4accf81"
        "?crop=entropy&cs=srgb&fm=jpg&q=85"
    ),
    letter=LetterContent(
        title="Surat Untuk Kamu, Cintaku ❤️",
        greeting="Hai, sayangkuu…",
        body=(
            "Selamat ulang tahun ya, cintaku ❤️\n\n"
            "Terima kasih sudah lahir ke dunia ini dan membawa begitu banyak tawa, "
            "kenyamanan, serta kehangatan di setiap hariku. Kuis tadi cuma sekadar "
            "permainan kecil pengantar senyum — tapi rasa sayang dan syukurku punya "
            "kamu itu sungguh tak terhingga.\n\n"
            "Terima kasih sudah jadi tempat pulang yang paling nyaman. Terima kasih "
            "untuk setiap ketawa lepas, setiap cerita random, setiap omongan manis "
            "sebelum tidur, dan setiap kali kamu bilang 'everything will be okay' "
            "padahal kamu juga sedang capek. Kamu itu kuat banget, dan aku bangga "
            "banget sama kamu.\n\n"
            "Semoga di usia barumu ini langkahmu selalu dimudahkan, hatimu selalu "
            "dilapangkan, dan senyum manismu tak pernah pudar. Apapun yang terjadi "
            "di masa depan, ingat ya: kamu selalu punya aku — rumah untuk pulang "
            "dan bercerita.\n\n"
            "Selamat ulang tahun yang paling indah. I love you, more than words can say! ✨🎂"
        ),
        signoff="Dengan seluruh hatiku,\n— pacarmu yang paling sayang kamu",
    ),
    titles=[
        TitleTier(
            min_score=7,
            max_score=8,
            emoji="🌟",
            title="Soulmate Sejati",
            message="Paham banget luar dalam! Aku makin jatuh cinta sama kamu 💘",
        ),
        TitleTier(
            min_score=5,
            max_score=6,
            emoji="💖",
            title="Pacar Idaman",
            message="Lumayan banget nih! Sisanya bisa kita lengkap bareng-bareng 😊",
        ),
        TitleTier(
            min_score=0,
            max_score=4,
            emoji="🥰",
            title="Wajib Kencan Lagi",
            message="Biar makin nempel! Jadi, kapan kita jadikan kencan impian itu? 🥺",
        ),
    ],
    photos=[
        MemoryPhoto(
            url=(
                "https://6abb2a6057212ca6e1eb20e2.imgix.net/sandbox/4.jpg"
                "?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            caption="Senja itu, aku cuma bisa lihat kamu",
            date_label="Momen kita",
        ),
        MemoryPhoto(
            url=(
                "https://images.unsplash.com/photo-1642237518668-49e94283a9a1"
                "?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            caption="Surat kecil, perasaan yang gak kecil-sama sekali",
            date_label="Kenangan manis",
        ),
        MemoryPhoto(
            url=(
                "https://images.unsplash.com/photo-1531683944026-e56b930467ad"
                "?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            caption="Foto-foto konyol kita yang paling aku suka",
            date_label="Liburan bareng",
        ),
        MemoryPhoto(
            url=(
                "https://images.unsplash.com/photo-1615966650071-855b15f29ad1"
                "?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            caption="Berjarak sedikit, tapi hati kita selalu seiringan",
            date_label="Pantai, sunset, kamu",
        ),
    ],
)


async def main() -> None:
    await ensure_indexes()

    if await db.quiz_config.count_documents({}) == 0:
        await db.quiz_config.insert_one({**CONFIG.model_dump(), "id": "main"})
        print("seed: quiz_config dibuat")
    else:
        print("seed: quiz_config sudah ada, dilewati")

    if await db.quiz_questions.count_documents({}) == 0:
        await db.quiz_questions.insert_many([q.model_dump() for q in QUESTIONS])
        print(f"seed: {len(QUESTIONS)} soal dibuat")
    else:
        print("seed: quiz_questions sudah ada, dilewati")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
