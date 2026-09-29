// Hand-written mirrors of the Pydantic models in backend/models/quiz.py — keep in sync
// in the same edit (nothing infers across the Python/TS boundary).

export interface MemoryPhoto {
  url: string;
  caption: string;
  date_label: string;
}

export interface LetterContent {
  title: string;
  greeting: string;
  body: string;
  signoff: string;
}

export interface TitleTier {
  min_score: number;
  max_score: number;
  emoji: string;
  title: string;
  message: string;
}

export interface QuizConfig {
  secret_word: string;
  gate_active: boolean;
  gate_hint: string;
  audio_url: string;
  hero_image_url: string;
  letter: LetterContent;
  titles: TitleTier[];
  photos: MemoryPhoto[];
}

export interface QuizQuestion {
  id: string;
  order: number;
  question: string;
  options: string[];
  correct_index: number;
  fun_fact: string;
}

export interface QuizContent {
  questions: QuizQuestion[];
  config: QuizConfig;
}

export interface QuizMeta {
  gate_active: boolean;
  gate_hint: string;
  ready: boolean;
}

export function titleForScore(titles: TitleTier[], score: number): TitleTier | null {
  const tier = titles.find((t) => score >= t.min_score && score <= t.max_score);
  return tier ?? titles[titles.length - 1] ?? null;
}

// Offline/static-preview fallback — mirrors backend/seed.py so the flow still works with
// no backend behind the page (the surprise content still hides behind the gate client-side).
export const DEFAULT_CONTENT: QuizContent = {
  questions: [
    {
      id: "q1",
      order: 1,
      question: "Makanan apa yang paling gabisa aku tolak kalo lagi laper tengah malem? 🤔",
      options: [
        "Martabak manis coklat keju 🤪",
        "Masak mie kuahh + telur 😋",
        "Nasi goreng warung kuningg 🥰",
        "Mie Gaocan level 1 maniss 🫣",
      ],
      correct_index: 0,
      fun_fact:
        "Huhuu aku sangat sukakk yang maniss dan seneng beli martabak malem malemm 🤤",
    },
    {
      id: "q2",
      order: 2,
      question: "Kalau lagi jalan di mall, tempat yang pasti aku lirik apa nyakk?",
      options: [
        "Toko baju sama sepatu 🤔",
        "Gramed cari barang dan buku 😴",
        "Tempet ice cream / boba sedepp 🤤",
        "Bioskop dungg ajak kamu nontoon teyus 🤩",
      ],
      correct_index: 2,
      fun_fact: "Biasanya langsung pesen chatimee pake promo tiktok xixii! 🧋",
    },
    {
      id: "q3",
      order: 3,
      question: "Apa yang biasa kamu lakuin yang paling sering bikin aku sukakk?",
      options: [
        "Suara kamu pas lagi imutt dan eyus aku 😝",
        "Sukak ke kosan dan suka peyukk 🫣",
        "Selalu masakin dengan masakan yang sedepp 😁",
        "Semuanya beneer dongg 😍",
      ],
      correct_index: 3,
      fun_fact: "Semuanya laa pasti aku sukak xixii 💖",
    },
    {
      id: "q4",
      order: 4,
      question: "Aku suka pas kamu lagi pake baju warna apa? (clue: ultah)",
      options: ["Merah merona menjelita 🫥", "Biru navy 🥶", "Hitam elegan dong 🙂‍↕️", "Cream cantikk 😶‍🌫️"],
      correct_index: 1,
      fun_fact: "Huhuu tak heran aku beliin baju warna biru 👀",
    },
    {
      id: "q5",
      order: 5,
      question: "Band apa yang paling aku suka selain The Adams?",
      options: [
        "Reality Club 😎",
        "Olivia Rodrigo nyakk 🤫",
        "Rumahsakit dongg 🏥",
        "Hindia dan Feast kerass 🤟🫨",
      ],
      correct_index: 2,
      fun_fact: "Hihii akuu selalu pake lagu Rumahsakit pas buat sg 🥹",
    },
    {
      id: "q6",
      order: 6,
      question: "Kalo kamu lagi sedihh, aku suka ngapain ke kamu supaya tak badmood lagi?",
      options: [
        "Kirim pap lucukk dan temeninn kamu 🤪",
        "Peyuk dan usep usep kamu teyuss 🥰",
        "Langsungg ajak keluar beliin mamm sedepp 🤤",
        "Semuanya niaan auto sembuh dalam sekejap xixii 🥹",
      ],
      correct_index: 3,
      fun_fact: "Sukak ngelakuin semuanyaa dan apa saja ke kamuu 🫶",
    },
    {
      id: "q7",
      order: 7,
      question: "Kencan impian kita selanjutnya yang paling kita pengeen?",
      options: [
        "Piknik di alam bareng kamuu ⛰️",
        "Jalan jalan ke europ dan london 😍",
        "Glamping di pegunungan berkabut 🫣",
        "Nonton film seharian sambil peyuuk 🫶",
      ],
      correct_index: 1,
      fun_fact: "Huhuu kita selaluu pengen jalan jalan ke europp 🥹",
    },
    {
      id: "q8",
      order: 8,
      question: "Harapan terbesarku untuk kamu di hari ulang tahun spesialmu ini adalah?",
      options: [
        "Selalu sehat dan bahagia serta dapat rezeki setiap hari",
        "Semua impian dan bisa cepat dapat kerja",
        "Kita bisa terus bareng bareng lewatin tahun ke depan",
        "Semua doa baik di atas, dan cinta yang tak pernah abiss!",
      ],
      correct_index: 3,
      fun_fact:
        "Selamat ulang tahun sayang! Aku bakal selalu ada buat dukung dan sayang kamu selamanya 🎉❤️",
    },
  ],
  config: {
    secret_word: "Sovers",
    gate_active: true,
    gate_hint: "Kata panggilan kesayangan kita 💖",
    audio_url: "https://audio.jukehost.co.uk/01a0ec37-52d3-72e3-9848-d02ee3813dca",
    hero_image_url:
      "https://images.unsplash.com/photo-1591969851586-adbbd4accf81?crop=entropy&cs=srgb&fm=jpg&q=85",
    letter: {
      title: "Surat Untuk kesayangankuu ❤️",
      greeting: "Hai, sayangkuu…",
      body:
        "Selamat ulang tahun ya, cintaku ❤️\n\n" +
        "Terima kasih sudah lahir ke dunia ini dan membawa begitu banyak canda, kenyamanan, " +
        "serta kehangatan di setiap hari kitaa. Kuis tadi cuman sekadar permainan kecikk pengantar " +
        "senyum hehe maaf kalo beyum sempurna, tapi rasa sayang dan syukur aku punya kamu itu sungguh tak terhingga niaan.\n\n" +
        "Terima kasih sudah jadi tempat pulang yang paling nyaman. Terima kasih untuk setiap " +
        "tertawa lepas, setiap cerita random, setiap omongan manis kamu, dan setiap " +
        "kali kamu bilang 'Its okay ya sayang' padahal kamu juga sedang capek. Aku sangat bersyukur untuk itu. Kamu itu " +
        "kuat banget, dan aku bangga banget sama kamu.\n\n" +
        "Semoga di usia baru kamu apapun selalu dimudahkan, hati kamu selalu dilapangkan, dan " +
        "senyuman kamu tak pernah pudar. Apapun yang terjadi di masa depan, ingat ya: kamu " +
        "selalu punya aku, tempat untuk pulang dan bercerita.\n\n" +
        "Selamat ulang tahun yaa cintakuu. I love you, more than words can say! ✨🎂",
      signoff: "Dengan seluruh hatiku,\n— pacarmu yang paling sipitt",
    },
    titles: [
      {
        min_score: 7,
        max_score: 8,
        emoji: "🌟",
        title: "Soulmate Sejati",
        message: "Paham niaan luar dalam! makin cintaa aku nihh sama kamu 💘",
      },
      {
        min_score: 5,
        max_score: 6,
        emoji: "💖",
        title: "Pacar Idaman",
        message: "Lumayan banget nih! Sisanya bisa kita lengkap bareng-bareng 😊",
      },
      {
        min_score: 0,
        max_score: 4,
        emoji: "🥰",
        title: "Wajib Kencan Lagi",
        message: "Biar makin nempel! 🥺",
      },
    ],
    photos: [
      {
        url: "https://6abb2a6057212ca6e1eb20e2.imgix.net/sandbox/IMG_0066.JPG",
        caption: "Konser pertama cekk 🥳",
        date_label: "Momen seruu sebelum jadiaan",
      },
      {
        url: "https://6abb2a6057212ca6e1eb20e2.imgix.net/sandbox/IMG_3665.JPG",
        caption: "Bisa ke konser kedua band favorit sama kamu xixi 😘",
        date_label: "Setelahh penantiaan akhirnyaa",
      },
      {
        url: "https://6abb2a6057212ca6e1eb20e2.imgix.net/sandbox/IMG_3944.PNG",
        caption: "Yahooo kapan kita ke dufan lagi nichh 😂",
        date_label: "Detik detik sebelum jadiaan",
      },
      {
        url: "https://6abb2a6057212ca6e1eb20e2.imgix.net/sandbox/IMG_3279.JPG",
        caption: "Senja yang kalah cantik dengan kamuu 🥹",
        date_label: "Pantai, sunset, kamu",
      },
    ],
  },
};
