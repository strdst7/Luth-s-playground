export type SubjectId = "mandarin" | "math" | "english" | "science" | "coding";

export type Question = {
  prompt: { en: string; ms: string };
  options: { en: string[]; ms: string[] };
  answer: number;
  visual: { en: string; ms: string };
  speak?: { en: string; ms: string };
  hint?: { en?: string; ms?: string };
};

export type Lesson = {
  id: string;
  title: { en: string; ms: string };
  subtitle: { en: string; ms: string };
  icon: string;
  questions: Question[];
};

export type Subject = {
  id: SubjectId;
  title: { en: string; ms: string };
  icon: string;
  color: string;
  light: string;
  dark: string;
  description: { en: string; ms: string };
  lessons: Lesson[];
};

const q = (
  prompt: { en: string; ms: string },
  options: { en: string[]; ms: string[] },
  answer: number,
  visual: { en: string; ms: string },
  speak?: { en: string; ms: string },
  hint?: { en?: string; ms?: string },
): Question => ({
  prompt, options, answer, visual, speak, hint,
});

export const subjects: Subject[] = [
  {
    id: "mandarin", title: { en: "Mandarin", ms: "Bahasa Cina" }, icon: "中", color: "#ff5a79", light: "#fff0f3", dark: "#d92e52",
    description: { en: "Speak, listen & discover!", ms: "Bercakap, dengar & teroka!" },
    lessons: [
      { id: "cn-colors", title: { en: "Rainbow Colors", ms: "Warna Pelangi" }, subtitle: { en: "颜色 · yánsè", ms: "颜色 · yánsè" }, icon: "🎨", questions: [
        q({ en: "Which color is 红色 (hóng sè)?", ms: "Warna manakah 红色 (hóng sè)?" }, { en: ["🔴 Red", "🔵 Blue", "🟢 Green"], ms: ["🔴 Merah", "🔵 Biru", "🟢 Hijau"] }, 0, { en: "🔴", ms: "🔴" }, { en: "红色", ms: "红色" }, { en: "Hóng sounds a little like 'home'.", ms: "Hóng bunyi macam 'home'." }),
        q({ en: "Which color is 蓝色 (lán sè)?", ms: "Warna manakah 蓝色 (lán sè)?" }, { en: ["🟡 Yellow", "🔵 Blue", "⚫ Black"], ms: ["🟡 Kuning", "🔵 Biru", "⚫ Hitam"] }, 1, { en: "🔵", ms: "🔵" }, { en: "蓝色", ms: "蓝色" }),
        q({ en: "What is 绿色 (lǜ sè)?", ms: "Apakah 绿色 (lǜ sè)?" }, { en: ["🟣 Purple", "🟠 Orange", "🟢 Green"], ms: ["🟣 Ungu", "🟠 Oren", "🟢 Hijau"] }, 2, { en: "🟢", ms: "🟢" }, { en: "绿色", ms: "绿色" }),
        q({ en: "Tap 黄色 (huáng sè).", ms: "Tekan 黄色 (huáng sè)." }, { en: ["🟢 Green", "🟡 Yellow", "🔴 Red"], ms: ["🟢 Hijau", "🟡 Kuning", "🔴 Merah"] }, 1, { en: "☀️", ms: "☀️" }, { en: "黄色", ms: "黄色" }),
      ]},
      { id: "cn-animals", title: { en: "Animal Friends", ms: "Rakan Haiwan" }, subtitle: { en: "动物 · dòngwù", ms: "动物 · dòngwù" }, icon: "🐼", questions: [
        q({ en: "Which animal is 猫 (māo)?", ms: "Haiwan manakah 猫 (māo)?" }, { en: ["🐶 Dog", "🐱 Cat", "🐰 Rabbit"], ms: ["🐶 Anjing", "🐱 Kucing", "🐰 Arnab"] }, 1, { en: "🐱", ms: "🐱" }, { en: "猫", ms: "猫" }),
        q({ en: "What does 狗 (gǒu) mean?", ms: "Apakah maksud 狗 (gǒu)?" }, { en: ["🐶 Dog", "🐟 Fish", "🐦 Bird"], ms: ["🐶 Anjing", "🐟 Ikan", "🐦 Burung"] }, 0, { en: "🐶", ms: "🐶" }, { en: "狗", ms: "狗" }),
        q({ en: "Find 熊猫 (xióng māo).", ms: "Cari 熊猫 (xióng māo)." }, { en: ["🦁 Lion", "🐼 Panda", "🐵 Monkey"], ms: ["🦁 Singa", "🐼 Panda", "🐵 Monyet"] }, 1, { en: "🎋", ms: "🎋" }, { en: "熊猫", ms: "熊猫" }),
        q({ en: "Which one is 鱼 (yú)?", ms: "Yang manakah 鱼 (yú)?" }, { en: ["🐟 Fish", "🐸 Frog", "🦋 Butterfly"], ms: ["🐟 Ikan", "🐸 Katak", "🦋 Rama-rama"] }, 0, { en: "🌊", ms: "🌊" }, { en: "鱼", ms: "鱼" }),
      ]},
      { id: "cn-numbers", title: { en: "Count to Ten", ms: "Kira hingga Sepuluh" }, subtitle: { en: "数字 · shùzì", ms: "数字 · shùzì" }, icon: "🔢", questions: [
        q({ en: "What number is 一 (yī)?", ms: "Nombor apakah 一 (yī)?" }, { en: ["1", "2", "3"], ms: ["1", "2", "3"] }, 0, { en: "1️⃣", ms: "1️⃣" }, { en: "一", ms: "一" }),
        q({ en: "Tap 三 (sān).", ms: "Tekan 三 (sān)." }, { en: ["2", "3", "5"], ms: ["2", "3", "5"] }, 1, { en: "3️⃣", ms: "3️⃣" }, { en: "三", ms: "三" }),
        q({ en: "What number is 五 (wǔ)?", ms: "Nombor apakah 五 (wǔ)?" }, { en: ["4", "8", "5"], ms: ["4", "8", "5"] }, 2, { en: "5️⃣", ms: "5️⃣" }, { en: "五", ms: "五" }),
        q({ en: "Which number is 十 (shí)?", ms: "Nombor manakah 十 (shí)?" }, { en: ["6", "10", "9"], ms: ["6", "10", "9"] }, 1, { en: "🔟", ms: "🔟" }, { en: "十", ms: "十" }),
      ]},
      { id: "cn-hello", title: { en: "Hello, Friend!", ms: "Hai, Kawan!" }, subtitle: { en: "你好 · nǐ hǎo", ms: "你好 · nǐ hǎo" }, icon: "👋", questions: [
        q({ en: "你好 (nǐ hǎo) means...", ms: "你好 (nǐ hǎo) bermaksud..." }, { en: ["Goodbye", "Hello", "Thank you"], ms: ["Selamat tinggal", "Hello", "Terima kasih"] }, 1, { en: "👋", ms: "👋" }, { en: "你好", ms: "你好" }),
        q({ en: "How do we say 'thank you'?", ms: "Macam mana nak cakap 'terima kasih'?" }, { en: ["谢谢 xièxie", "再见 zàijiàn", "你好 nǐ hǎo"], ms: ["谢谢 xièxie", "再见 zàijiàn", "你好 nǐ hǎo"] }, 0, { en: "🙏", ms: "🙏" }, { en: "谢谢", ms: "谢谢" }),
        q({ en: "再见 (zàijiàn) means...", ms: "再见 (zàijiàn) bermaksud..." }, { en: ["Please", "Hello", "Goodbye"], ms: ["Tolong", "Hello", "Selamat tinggal"] }, 2, { en: "👋", ms: "👋" }, { en: "再见", ms: "再见" }),
        q({ en: "早上好 (zǎoshang hǎo) means...", ms: "早上好 (zǎoshang hǎo) bermaksud..." }, { en: ["Good morning", "Good night", "Good job"], ms: ["Selamat pagi", "Selamat malam", "Kerja bagus"] }, 0, { en: "🌅", ms: "🌅" }, { en: "早上好", ms: "早上好" }),
      ]},
      { id: "cn-review", title: { en: "Mandarin Quest", ms: "Cabaran Bahasa Cina" }, subtitle: { en: "复习 · fùxí", ms: "复习 · fùxí" }, icon: "🏮", questions: [
        q({ en: "What is this? 熊猫", ms: "Apakah ini? 熊猫" }, { en: ["🐼 Panda", "🐯 Tiger", "🐻 Bear"], ms: ["🐼 Panda", "🐯 Harimau", "🐻 Beruang"] }, 0, { en: "🐼", ms: "🐼" }, { en: "熊猫", ms: "熊猫" }),
        q({ en: "Which one means 2?", ms: "Yang manakah maksudnya 2?" }, { en: ["一 yī", "二 èr", "四 sì"], ms: ["一 yī", "二 èr", "四 sì"] }, 1, { en: "2️⃣", ms: "2️⃣" }, { en: "二", ms: "二" }),
        q({ en: "绿色 is which color?", ms: "绿色 warna apakah?" }, { en: ["Pink", "Green", "White"], ms: ["Merah jambu", "Hijau", "Putih"] }, 1, { en: "🌿", ms: "🌿" }, { en: "绿色", ms: "绿色" }),
        q({ en: "Say goodbye in Mandarin!", ms: "Ucapkan selamat tinggal dalam Bahasa Cina!" }, { en: ["谢谢", "你好", "再见"], ms: ["谢谢", "你好", "再见"] }, 2, { en: "👋", ms: "👋" }, { en: "再见", ms: "再见" }),
      ]},
    ],
  },
  {
    id: "math", title: { en: "Math", ms: "Matematik" }, icon: "123", color: "#6b62e8", light: "#f0efff", dark: "#4c43bd",
    description: { en: "Count, add & solve!", ms: "Kira, tambah & selesai!" },
    lessons: [
      { id: "math-count", title: { en: "Count the Blocks", ms: "Kira Blok" }, subtitle: { en: "Numbers 1–10", ms: "Nombor 1–10" }, icon: "🧱", questions: [
        q({ en: "How many stars do you see?", ms: "Berapa banyak bintang yang kamu nampak?" }, { en: ["3", "4", "5"], ms: ["3", "4", "5"] }, 1, { en: "⭐ ⭐ ⭐ ⭐", ms: "⭐ ⭐ ⭐ ⭐" }),
        q({ en: "Count the apples!", ms: "Kira epal!" }, { en: ["5", "6", "7"], ms: ["5", "6", "7"] }, 2, { en: "🍎 🍎 🍎 🍎 🍎 🍎 🍎", ms: "🍎 🍎 🍎 🍎 🍎 🍎 🍎" }),
        q({ en: "How many blue gems?", ms: "Berapa banyak permata biru?" }, { en: ["2", "3", "4"], ms: ["2", "3", "4"] }, 0, { en: "💎 💎", ms: "💎 💎" }),
        q({ en: "Count the rocket ships.", ms: "Kira roket." }, { en: ["1", "2", "3"], ms: ["1", "2", "3"] }, 2, { en: "🚀 🚀 🚀", ms: "🚀 🚀 🚀" }),
      ]},
      { id: "math-add", title: { en: "Addition Power", ms: "Kuasa Penambahan" }, subtitle: { en: "Put groups together", ms: "Gabungkan kumpulan" }, icon: "➕", questions: [
        q({ en: "2 + 1 = ?", ms: "2 + 1 = ?" }, { en: ["2", "3", "4"], ms: ["2", "3", "4"] }, 1, { en: "🍓 🍓 + 🍓", ms: "🍓 🍓 + 🍓" }),
        q({ en: "3 + 2 = ?", ms: "3 + 2 = ?" }, { en: ["5", "4", "6"], ms: ["5", "4", "6"] }, 0, { en: "3 + 2", ms: "3 + 2" }),
        q({ en: "4 + 1 = ?", ms: "4 + 1 = ?" }, { en: ["3", "4", "5"], ms: ["3", "4", "5"] }, 2, { en: "4 + 1", ms: "4 + 1" }),
        q({ en: "2 + 2 = ?", ms: "2 + 2 = ?" }, { en: ["4", "5", "3"], ms: ["4", "5", "3"] }, 0, { en: "🐝🐝 + 🐝🐝", ms: "🐝🐝 + 🐝🐝" }),
      ]},
      { id: "math-shapes", title: { en: "Shape Builder", ms: "Pembina Bentuk" }, subtitle: { en: "Corners and sides", ms: "Bucu dan sisi" }, icon: "🔷", questions: [
        q({ en: "Which shape has 3 sides?", ms: "Bentuk mana ada 3 sisi?" }, { en: ["Circle", "Triangle", "Square"], ms: ["Bulat", "Segi tiga", "Segi empat"] }, 1, { en: "🔺", ms: "🔺" }),
        q({ en: "Which shape is round?", ms: "Bentuk mana yang bulat?" }, { en: ["Circle", "Rectangle", "Triangle"], ms: ["Bulat", "Segi empat tepat", "Segi tiga"] }, 0, { en: "🔵", ms: "🔵" }),
        q({ en: "How many sides does a square have?", ms: "Berapa sisi ada segi empat?" }, { en: ["3", "4", "5"], ms: ["3", "4", "5"] }, 1, { en: "🟨", ms: "🟨" }),
        q({ en: "Find the rectangle.", ms: "Cari segi empat tepat." }, { en: ["🔺 Triangle", "🟦 Square", "▰ Rectangle"], ms: ["🔺 Segi tiga", "🟦 Segi empat", "▰ Segi empat tepat"] }, 2, { en: "▰", ms: "▰" }),
      ]},
      { id: "math-compare", title: { en: "Number Battle", ms: "Pertempuran Nombor" }, subtitle: { en: "More, less or equal", ms: "Lebih, kurang atau sama" }, icon: "⚖️", questions: [
        q({ en: "Which number is bigger?", ms: "Nombor mana lebih besar?" }, { en: ["3", "7", "They match"], ms: ["3", "7", "Sama"] }, 1, { en: "3  ⚔️  7", ms: "3  ⚔️  7" }),
        q({ en: "Which group has more?", ms: "Kumpulan mana ada lebih?" }, { en: ["🍪🍪", "🍪🍪🍪🍪", "Same"], ms: ["🍪🍪", "🍪🍪🍪🍪", "Sama"] }, 1, { en: "🍪", ms: "🍪" }),
        q({ en: "Is 5 less than or more than 2?", ms: "5 kurang atau lebih daripada 2?" }, { en: ["Less", "More", "Equal"], ms: ["Kurang", "Lebih", "Sama"] }, 1, { en: "5 > 2", ms: "5 > 2" }),
        q({ en: "Which pair is equal?", ms: "Pasangan mana yang sama?" }, { en: ["2 and 3", "4 and 4", "5 and 1"], ms: ["2 dan 3", "4 dan 4", "5 dan 1"] }, 1, { en: "⚖️", ms: "⚖️" }),
      ]},
      { id: "math-review", title: { en: "Math Boss", ms: "Bos Matematik" }, subtitle: { en: "Mixed number quest", ms: "Cabaran nombor campuran" }, icon: "🏆", questions: [
        q({ en: "5 + 3 = ?", ms: "5 + 3 = ?" }, { en: ["7", "8", "9"], ms: ["7", "8", "9"] }, 1, { en: "5 + 3", ms: "5 + 3" }),
        q({ en: "Count the hearts.", ms: "Kira hati." }, { en: ["4", "5", "6"], ms: ["4", "5", "6"] }, 2, { en: "❤️ ❤️ ❤️ ❤️ ❤️ ❤️", ms: "❤️ ❤️ ❤️ ❤️ ❤️ ❤️" }),
        q({ en: "Which shape has no corners?", ms: "Bentuk mana yang tiada bucu?" }, { en: ["Circle", "Square", "Triangle"], ms: ["Bulat", "Segi empat", "Segi tiga"] }, 0, { en: "🟣", ms: "🟣" }),
        q({ en: "Which number is smallest?", ms: "Nombor mana paling kecil?" }, { en: ["9", "6", "2"], ms: ["9", "6", "2"] }, 2, { en: "9 · 6 · 2", ms: "9 · 6 · 2" }),
      ]},
    ],
  },
  {
    id: "english", title: { en: "English", ms: "Bahasa Inggeris" }, icon: "ABC", color: "#f29a33", light: "#fff6e8", dark: "#c96e0b",
    description: { en: "Letters, words & sounds!", ms: "Huruf, perkataan & bunyi!" },
    lessons: [
      { id: "en-letters", title: { en: "Letter Quest", ms: "Cabaran Huruf" }, subtitle: { en: "Meet the ABCs", ms: "Kenali ABC" }, icon: "🔤", questions: [
        q({ en: "Which letter starts APPLE?", ms: "Huruf mana yang mulakan EPAL?" }, { en: ["A", "B", "P"], ms: ["A", "B", "P"] }, 0, { en: "🍎", ms: "🍎" }),
        q({ en: "Which letter starts BALL?", ms: "Huruf mana yang mulakan BOLA?" }, { en: ["D", "B", "T"], ms: ["D", "B", "T"] }, 1, { en: "⚽", ms: "⚽" }),
        q({ en: "What comes after C?", ms: "Apa selepas C?" }, { en: ["B", "E", "D"], ms: ["B", "E", "D"] }, 2, { en: "A B C _", ms: "A B C _" }),
        q({ en: "Find the lowercase G.", ms: "Cari huruf kecil G." }, { en: ["q", "g", "j"], ms: ["q", "g", "j"] }, 1, { en: "G g", ms: "G g" }),
      ]},
      { id: "en-sight", title: { en: "Word Wizard", ms: "Pakar Perkataan" }, subtitle: { en: "Words we see a lot", ms: "Perkataan yang sering dilihat" }, icon: "✨", questions: [
        q({ en: "Tap the word 'THE'.", ms: "Tekan perkataan 'THE'." }, { en: ["THE", "THEN", "THAT"], ms: ["THE", "THEN", "THAT"] }, 0, { en: "👀", ms: "👀" }),
        q({ en: "Which word says 'YOU'?", ms: "Perkataan mana yang 'YOU'?" }, { en: ["YOUR", "YES", "YOU"], ms: ["YOUR", "YES", "YOU"] }, 2, { en: "👉", ms: "👉" }),
        q({ en: "Complete: I ___ happy.", ms: "Lengkapkan: Saya ___ gembira." }, { en: ["am", "is", "the"], ms: ["am", "is", "the"] }, 0, { en: "😊", ms: "😊" }),
        q({ en: "Which word says 'AND'?", ms: "Perkataan mana 'AND'?" }, { en: ["ADD", "AND", "ANT"], ms: ["ADD", "AND", "ANT"] }, 1, { en: "➕", ms: "➕" }),
      ]},
      { id: "en-rhyme", title: { en: "Rhyme Time", ms: "Masa Sajak" }, subtitle: { en: "Words that sound alike", ms: "Perkataan yang sama bunyi" }, icon: "🎵", questions: [
        q({ en: "What rhymes with CAT?", ms: "Apa yang sama bunyi dengan KUCING?" }, { en: ["Sun", "Hat", "Dog"], ms: ["Matahari", "Topi", "Anjing"] }, 1, { en: "🐱 + 🎩", ms: "🐱 + 🎩" }),
        q({ en: "What rhymes with LOG?", ms: "Apa yang sama bunyi dengan KAYU?" }, { en: ["Frog", "Fish", "Leaf"], ms: ["Katak", "Ikan", "Daun"] }, 0, { en: "🪵 + 🐸", ms: "🪵 + 🐸" }),
        q({ en: "What rhymes with STAR?", ms: "Apa yang sama bunyi dengan BINTANG?" }, { en: ["Moon", "Car", "Sky"], ms: ["Bulan", "Kereta", "Langit"] }, 1, { en: "⭐ + 🚗", ms: "⭐ + 🚗" }),
        q({ en: "What rhymes with BEE?", ms: "Apa yang sama bunyi dengan LEBAH?" }, { en: ["Tree", "Bug", "Hive"], ms: ["Pokok", "Pepijat", "Sarang"] }, 0, { en: "🐝 + 🌳", ms: "🐝 + 🌳" }),
      ]},
      { id: "en-opposite", title: { en: "Opposite Land", ms: "Dunia Lawan" }, subtitle: { en: "Big and small", ms: "Besar dan kecil" }, icon: "↔️", questions: [
        q({ en: "What is the opposite of BIG?", ms: "Apa lawan BESAR?" }, { en: ["Tall", "Small", "Wide"], ms: ["Tinggi", "Kecil", "Lebar"] }, 1, { en: "🐘 ↔️ 🐭", ms: "🐘 ↔️ 🐭" }),
        q({ en: "What is the opposite of HOT?", ms: "Apa lawan PANAS?" }, { en: ["Cold", "Warm", "Sunny"], ms: ["Sejuk", "Suam", "Cerah"] }, 0, { en: "🔥 ↔️ ❄️", ms: "🔥 ↔️ ❄️" }),
        q({ en: "What is the opposite of UP?", ms: "Apa lawan ATAS?" }, { en: ["Over", "Down", "Under"], ms: ["Atas", "Bawah", "Bawah"] }, 1, { en: "⬆️ ↔️ ⬇️", ms: "⬆️ ↔️ ⬇️" }),
        q({ en: "What is the opposite of FAST?", ms: "Apa lawan CEPAT?" }, { en: ["Slow", "Quick", "Loud"], ms: ["Lambat", "Cepat", "Kuat"] }, 0, { en: "🐆 ↔️ 🐢", ms: "🐆 ↔️ 🐢" }),
      ]},
      { id: "en-review", title: { en: "Storybook Boss", ms: "Bos Buku Cerita" }, subtitle: { en: "Mixed word quest", ms: "Cabaran perkataan campuran" }, icon: "📚", questions: [
        q({ en: "Which letter starts SUN?", ms: "Huruf mana yang mulakan MATAHARI?" }, { en: ["C", "S", "F"], ms: ["C", "S", "F"] }, 1, { en: "☀️", ms: "☀️" }),
        q({ en: "Finish: You ___ my friend.", ms: "Lengkapkan: Kamu ___ kawan saya." }, { en: ["are", "is", "am"], ms: ["are", "is", "am"] }, 0, { en: "🤝", ms: "🤝" }),
        q({ en: "What rhymes with MOON?", ms: "Apa yang sama bunyi dengan BULAN?" }, { en: ["Star", "Spoon", "Night"], ms: ["Bintang", "Sudu", "Malam"] }, 1, { en: "🌙 + 🥄", ms: "🌙 + 🥄" }),
        q({ en: "Opposite of DAY is...", ms: "Lawan SIANG ialah..." }, { en: ["Light", "Night", "Morning"], ms: ["Cahaya", "Malam", "Pagi"] }, 1, { en: "🌞 ↔️ 🌙", ms: "🌞 ↔️ 🌙" }),
      ]},
    ],
  },
  {
    id: "science", title: { en: "Science", ms: "Sains" }, icon: "⚗", color: "#20ae78", light: "#eafbf4", dark: "#087c52",
    description: { en: "Explore our amazing world!", ms: "Terokai dunia yang menakjubkan!" },
    lessons: [
      { id: "sci-animals", title: { en: "Animal Explorer", ms: "Penjelajah Haiwan" }, subtitle: { en: "Habitats and bodies", ms: "Habitat dan badan" }, icon: "🦁", questions: [
        q({ en: "Which animal lives in the ocean?", ms: "Haiwan mana tinggal di lautan?" }, { en: ["Dolphin", "Lion", "Chicken"], ms: ["Ikan lumba-lumba", "Singa", "Ayam"] }, 0, { en: "🐬", ms: "🐬" }),
        q({ en: "Which animal has feathers?", ms: "Haiwan mana ada bulu pelepah?" }, { en: ["Cat", "Bird", "Frog"], ms: ["Kucing", "Burung", "Katak"] }, 1, { en: "🐦", ms: "🐦" }),
        q({ en: "What does a caterpillar become?", ms: "Apa jadi ulat bulu?" }, { en: ["Bee", "Butterfly", "Spider"], ms: ["Lebah", "Rama-rama", "Labah-labah"] }, 1, { en: "🐛 ➜ 🦋", ms: "🐛 ➜ 🦋" }),
        q({ en: "Which animal is a mammal?", ms: "Haiwan mana yang mamalia?" }, { en: ["Shark", "Frog", "Dog"], ms: ["Jerung", "Katak", "Anjing"] }, 2, { en: "🐶", ms: "🐶" }),
      ]},
      { id: "sci-plants", title: { en: "Garden Lab", ms: "Makmal Taman" }, subtitle: { en: "How plants grow", ms: "Cara tumbuhan membesar" }, icon: "🌱", questions: [
        q({ en: "What do plants need to grow?", ms: "Apa yang tumbuhan perlukan untuk membesar?" }, { en: ["Sunlight", "Toys", "Shoes"], ms: ["Cahaya matahari", "Mainan", "Kasut"] }, 0, { en: "🌱 + ☀️", ms: "🌱 + ☀️" }),
        q({ en: "Which part takes in water?", ms: "Bahagian mana serap air?" }, { en: ["Flower", "Roots", "Fruit"], ms: ["Bunga", "Akar", "Buah"] }, 1, { en: "🌳", ms: "🌳" }),
        q({ en: "What grows from a seed?", ms: "Apa yang tumbuh dari biji benih?" }, { en: ["Rock", "Plant", "Cloud"], ms: ["Batu", "Tumbuhan", "Awan"] }, 1, { en: "🌰 ➜ 🌱", ms: "🌰 ➜ 🌱" }),
        q({ en: "Which part is often green?", ms: "Bahagian mana selalu hijau?" }, { en: ["Leaf", "Root", "Soil"], ms: ["Daun", "Akar", "Tanah"] }, 0, { en: "🍃", ms: "🍃" }),
      ]},
      { id: "sci-weather", title: { en: "Weather Watch", ms: "Pemantauan Cuaca" }, subtitle: { en: "Sun, wind and rain", ms: "Matahari, angin dan hujan" }, icon: "🌦️", questions: [
        q({ en: "What falls from rain clouds?", ms: "Apa yang turun dari awan hujan?" }, { en: ["Sand", "Rain", "Leaves"], ms: ["Pasir", "Hujan", "Daun"] }, 1, { en: "🌧️", ms: "🌧️" }),
        q({ en: "Which tool measures temperature?", ms: "Alat mana yang ukur suhu?" }, { en: ["Thermometer", "Telescope", "Ruler"], ms: ["Termometer", "Teleskop", "Pembaris"] }, 0, { en: "🌡️", ms: "🌡️" }),
        q({ en: "What should you wear in snow?", ms: "Apa patut pakai dalam salji?" }, { en: ["Swimsuit", "Warm coat", "Sandals"], ms: ["Baju renang", "Jaket tebal", "Selipar"] }, 1, { en: "❄️ 🧥", ms: "❄️ 🧥" }),
        q({ en: "What can move a kite?", ms: "Apa yang boleh gerakkan layang-layang?" }, { en: ["Wind", "Dark", "Mud"], ms: ["Angin", "Gelap", "Lumpur"] }, 0, { en: "🪁 💨", ms: "🪁 💨" }),
      ]},
      { id: "sci-body", title: { en: "Amazing Body", ms: "Badan Hebat" }, subtitle: { en: "Your super-powered self", ms: "Diri anda yang hebat" }, icon: "🫀", questions: [
        q({ en: "Which body part helps you see?", ms: "Bahagian badan mana yang tolong awak nampak?" }, { en: ["Ears", "Eyes", "Knees"], ms: ["Telinga", "Mata", "Lutut"] }, 1, { en: "👀", ms: "👀" }),
        q({ en: "What pumps blood around your body?", ms: "Apa yang pam darah keliling badan?" }, { en: ["Heart", "Stomach", "Teeth"], ms: ["Jantung", "Perut", "Gigi"] }, 0, { en: "❤️", ms: "❤️" }),
        q({ en: "Which body part helps you hear?", ms: "Bahagian badan mana tolong awak dengar?" }, { en: ["Nose", "Fingers", "Ears"], ms: ["Hidung", "Jari", "Telinga"] }, 2, { en: "👂", ms: "👂" }),
        q({ en: "What protects your brain?", ms: "Apa yang lindungi otak awak?" }, { en: ["Skull", "Elbow", "Foot"], ms: ["Tengkorak", "Siku", "Kaki"] }, 0, { en: "🧠", ms: "🧠" }),
      ]},
      { id: "sci-review", title: { en: "Science Boss", ms: "Bos Sains" }, subtitle: { en: "Mixed discovery quest", ms: "Cabaran penemuan campuran" }, icon: "🔬", questions: [
        q({ en: "Which is living?", ms: "Yang mana hidup?" }, { en: ["Rock", "Tree", "Spoon"], ms: ["Batu", "Pokok", "Sudu"] }, 1, { en: "🌳", ms: "🌳" }),
        q({ en: "What do we call frozen water?", ms: "Apa kita panggil air beku?" }, { en: ["Steam", "Rain", "Ice"], ms: ["Stim", "Hujan", "Ais"] }, 2, { en: "🧊", ms: "🧊" }),
        q({ en: "Which animal lays eggs?", ms: "Haiwan mana yang bertelur?" }, { en: ["Chicken", "Cat", "Dog"], ms: ["Ayam", "Kucing", "Anjing"] }, 0, { en: "🥚", ms: "🥚" }),
        q({ en: "What helps us smell?", ms: "Apa yang tolong kita hidu?" }, { en: ["Hands", "Nose", "Eyes"], ms: ["Tangan", "Hidung", "Mata"] }, 1, { en: "👃", ms: "👃" }),
      ]},
    ],
  },
  {
    id: "coding", title: { en: "Coding", ms: "Kod" }, icon: "</>", color: "#3d91e8", light: "#eaf5ff", dark: "#176bbd",
    description: { en: "Patterns, puzzles & logic!", ms: "Corak, teka-teki & logik!" },
    lessons: [
      { id: "code-pattern", title: { en: "Pattern Power", ms: "Kuasa Corak" }, subtitle: { en: "What comes next?", ms: "Apa seterusnya?" }, icon: "🔁", questions: [
        q({ en: "What comes next?", ms: "Apa seterusnya?" }, { en: ["🔴", "🔵", "🟢"], ms: ["🔴", "🔵", "🟢"] }, 0, { en: "🔴 🔵 🔴 🔵 __", ms: "🔴 🔵 🔴 🔵 __" }),
        q({ en: "Finish the pattern.", ms: "Lengkapkan corak." }, { en: ["⭐", "🌙", "☀️"], ms: ["⭐", "🌙", "☀️"] }, 1, { en: "⭐ ⭐ 🌙 ⭐ ⭐ __", ms: "⭐ ⭐ 🌙 ⭐ ⭐ __" }),
        q({ en: "What comes next?", ms: "Apa seterusnya?" }, { en: ["2", "3", "4"], ms: ["2", "3", "4"] }, 2, { en: "1 2 3 1 2 3 1 2 __", ms: "1 2 3 1 2 3 1 2 __" }),
        q({ en: "Find the missing block.", ms: "Cari blok yang hilang." }, { en: ["🟨", "🟪", "🟧"], ms: ["🟨", "🟪", "🟧"] }, 0, { en: "🟨 🟪 🟪 🟨 🟪 🟪 __", ms: "🟨 🟪 🟪 🟨 🟪 🟪 __" }),
      ]},
      { id: "code-sequence", title: { en: "Robot Steps", ms: "Langkah Robot" }, subtitle: { en: "Put actions in order", ms: "Susun aturan" }, icon: "🤖", questions: [
        q({ en: "What happens first when brushing teeth?", ms: "Apa yang pertama semasa gosok gigi?" }, { en: ["Brush", "Get toothbrush", "Rinse"], ms: ["Gosok", "Ambil berus gigi", "Bilas"] }, 1, { en: "🪥", ms: "🪥" }),
        q({ en: "To plant a seed, what comes after digging?", ms: "Untuk tanam benih, apa selepas gali?" }, { en: ["Add seed", "Pick flower", "Eat fruit"], ms: ["Letak benih", "Petik bunga", "Makan buah"] }, 0, { en: "🪴", ms: "🪴" }),
        q({ en: "Robot faces a star. Which command moves closer?", ms: "Robot hadap bintang. Arahan mana yang dekatkan?" }, { en: ["Turn around", "Move forward", "Stop"], ms: ["Pusing", "Maju ke depan", "Berhenti"] }, 1, { en: "🤖 ➡️ ⭐", ms: "🤖 ➡️ ⭐" }),
        q({ en: "After putting on socks, what comes next?", ms: "Selepas pakai stoking, apa seterusnya?" }, { en: ["Shoes", "Bath", "Breakfast"], ms: ["Kasut", "Mandi", "Sarapan"] }, 0, { en: "🧦 ➜ 👟", ms: "🧦 ➜ 👟" }),
      ]},
      { id: "code-bugs", title: { en: "Bug Buster", ms: "Pembasmi Pepijat" }, subtitle: { en: "Find what went wrong", ms: "Cari apa yang salah" }, icon: "🐞", questions: [
        q({ en: "The robot should move 2 steps but moved 3. What is wrong?", ms: "Robot patut gerak 2 langkah tapi gerak 3. Apa salah?" }, { en: ["Too many steps", "Wrong color", "No sound"], ms: ["Terlalu banyak langkah", "Warna salah", "Tiada bunyi"] }, 0, { en: "🤖 ➡️ ➡️ ➡️", ms: "🤖 ➡️ ➡️ ➡️" }),
        q({ en: "Which block breaks the color pattern?", ms: "Blok mana yang rosakkan corak warna?" }, { en: ["🔴 first", "🟢 middle", "🔵 last"], ms: ["🔴 pertama", "🟢 tengah", "🔵 akhir"] }, 1, { en: "🔴 🔵 🟢 🔵 🔴", ms: "🔴 🔵 🟢 🔵 🔴" }),
        q({ en: "The recipe skips mixing. What should we add?", ms: "Resepi tak ada langkah kacau. Apa patut tambah?" }, { en: ["Mix", "Sleep", "Run"], ms: ["Kacau", "Tidur", "Lari"] }, 0, { en: "🥣 ❓ 🔥", ms: "🥣 ❓ 🔥" }),
        q({ en: "Robot must turn left but turns right. Fix it!", ms: "Robot kena pusing kiri tapi pusing kanan. Betulkan!" }, { en: ["Go faster", "Turn left", "Jump"], ms: ["Laju lagi", "Pusing kiri", "Lompat"] }, 1, { en: "🤖 ↪️", ms: "🤖 ↪️" }),
      ]},
      { id: "code-logic", title: { en: "Logic Lab", ms: "Makmal Logik" }, subtitle: { en: "Think like a coder", ms: "Berfikir seperti pengkod" }, icon: "🧠", questions: [
        q({ en: "All red blocks go in the red box. Where does this go?", ms: "Semua blok merah masuk kotak merah. Yang ni masuk mana?" }, { en: ["Red box", "Blue box", "Trash"], ms: ["Kotak merah", "Kotak biru", "Tong sampah"] }, 0, { en: "🟥 ➜ ❓", ms: "🟥 ➜ ❓" }),
        q({ en: "If it rains, use an umbrella. It is raining. What do you take?", ms: "Kalau hujan, guna payung. Sekarang hujan. Apa ambil?" }, { en: ["Kite", "Umbrella", "Sunglasses"], ms: ["Layang-layang", "Payung", "Cermin mata hitam"] }, 1, { en: "🌧️", ms: "🌧️" }),
        q({ en: "Which route reaches the treasure?", ms: "Laluan mana sampai ke harta karun?" }, { en: ["Right, right", "Left, left", "Stay still"], ms: ["Kanan, kanan", "Kiri, kiri", "Diam"] }, 0, { en: "🤖 ➡️ ➡️ 💎", ms: "🤖 ➡️ ➡️ 💎" }),
        q({ en: "Which one does NOT belong?", ms: "Yang mana TIDAK sepatutnya ada?" }, { en: ["🍎", "🍌", "🚗"], ms: ["🍎", "🍌", "🚗"] }, 2, { en: "🍎 🍌 🚗", ms: "🍎 🍌 🚗" }),
      ]},
      { id: "code-review", title: { en: "Code Boss", ms: "Bos Kod" }, subtitle: { en: "Ultimate logic quest", ms: "Cabaran logik muktamad" }, icon: "👾", questions: [
        q({ en: "Finish: 🟢 🟡 🟢 🟡 __", ms: "Lengkapkan: 🟢 🟡 🟢 🟡 __" }, { en: ["🟢", "🟡", "🔴"], ms: ["🟢", "🟡", "🔴"] }, 0, { en: "🔁", ms: "🔁" }),
        q({ en: "What should a robot do at a STOP sign?", ms: "Apa robot patut buat di papan BERHENTI?" }, { en: ["Stop", "Speed up", "Spin"], ms: ["Berhenti", "Laju", "Pusing"] }, 0, { en: "🤖 🛑", ms: "🤖 🛑" }),
        q({ en: "Spot the bug: 2, 4, 6, 7, 8", ms: "Cari pepijat: 2, 4, 6, 7, 8" }, { en: ["2", "7", "8"], ms: ["2", "7", "8"] }, 1, { en: "🐞", ms: "🐞" }),
        q({ en: "If hungry, then...", ms: "Kalau lapar, maka..." }, { en: ["Eat food", "Wear boots", "Open umbrella"], ms: ["Makan", "Pakai but", "Buka payung"] }, 0, { en: "😋 ➜ 🍎", ms: "😋 ➜ 🍎" }),
      ]},
    ],
  },
];

export const subjectMap = Object.fromEntries(subjects.map((subject) => [subject.id, subject])) as Record<SubjectId, Subject>;

export const avatars = ["🧑‍🚀", "🦸", "🧙", "🐼", "🦁", "🦊", "🐯", "🤖", "🐲", "🦄", "🥷", "👑"];

export const badgeCatalog = [
  { id: "first", icon: "🌟", name: "First Quest", note: "Finish your first lesson" },
  { id: "perfect", icon: "💯", name: "Perfect Score", note: "Get every answer right" },
  { id: "pattern", icon: "🔁", name: "Pattern Pro", note: "Master a coding lesson" },
  { id: "allround", icon: "🦄", name: "Renaissance Kid", note: "Try every subject" },
  { id: "streak3", icon: "🔥", name: "3-Day Streak", note: "Learn 3 days in a row" },
  { id: "streak7", icon: "⚡", name: "7-Day Spark", note: "Learn 7 days in a row" },
  { id: "streak30", icon: "🌈", name: "Rainbow Month", note: "Learn 30 days in a row" },
  { id: "xp100", icon: "💎", name: "100 XP", note: "Collect 100 XP" },
  { id: "xp500", icon: "👑", name: "500 XP", note: "Collect 500 XP" },
  ...subjects.flatMap((subject) => [
    { id: `${subject.id}1`, icon: subject.icon, name: `${subject.title.en} Starter`, note: "Finish 1 lesson" },
    { id: `${subject.id}3`, icon: "🏅", name: `${subject.title.en} Star`, note: "Finish 3 lessons" },
    { id: `${subject.id}5`, icon: "🏆", name: `${subject.title.en} Champion`, note: "Finish all 5 lessons" },
  ]),
  { id: "curious", icon: "🔭", name: "Curious Mind", note: "Explore Science" },
  { id: "wordsmith", icon: "📖", name: "Word Hero", note: "Explore English" },
  { id: "number", icon: "🔢", name: "Number Ninja", note: "Explore Math" },
] as const;
