// Taxonomi pedagogi Indonesia — static reference data (kurikulum, pendekatan, model,
// metode, strategi). Lives in the frontend so dropdowns, auto-sintaks, and the reference
// library render instantly and survive a static/CDN build with no backend.

export interface CurriculumInfo {
  id: string;
  name: string;
  description: string;
  instruments: string[];
  assessment: string;
}

export interface ApproachInfo {
  id: string;
  name: string;
  description: string;
  implementation: string[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  rationale: string;
  syntax: string[];
  suitedFor: string[];
}

export interface MethodInfo {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
}

export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
}

export interface LevelInfo {
  id: string;
  label: string;
  grades: { grade: string; phase: string }[];
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  modul_ajar: "Modul Ajar",
  rpp: "RPP",
  atp: "ATP",
  kktp: "KKTP / KKM",
  sumatif: "Kisi-Kisi & Soal Sumatif",
  lkpd: "LKPD",
};

export const CURRICULA: CurriculumInfo[] = [
  {
    id: "merdeka",
    name: "Kurikulum Merdeka",
    description:
      "Kurikulum nasional sejak 2022 (Permendikbudristek No. 12/2024) yang berfokus pada materi esensial, fleksibilitas satuan pendidikan, dan Capaian Pembelajaran (CP) per fase. Perangkat utamanya: Modul Ajar, ATP, dan KKTP.",
    instruments: ["Modul Ajar (RPP Plus)", "Alur Tujuan Pembelajaran (ATP)", "KKTP", "Rapor Pendidikan"],
    assessment:
      "Asesmen diagnostik, formatif (as/for learning), dan sumatif; dilaporkan melalui rapor bersifat informasi perkembangan.",
  },
  {
    id: "k13",
    name: "Kurikulum 2013 (K13)",
    description:
      "Kurikulum berbasis kompetensi dengan perangkat Silabus dan RPP, menggunakan pendekatan Saintifik 5M serta penilaian ranah sikap, pengetahuan, dan keterampilan.",
    instruments: ["Silabus", "RPP", "Prota & Promes", "KKM"],
    assessment:
      "Penilaian sikap (jurnal/observasi), pengetahuan (tes), dan keterampilan (praktik/portofolio); ketuntasan diukur dengan KKM.",
  },
  {
    id: "darurat",
    name: "Kurikulum Darurat (2020–2022)",
    description:
      "Kurikulum penyelamat pembelajaran masa pandemi Covid-19 yang menitikberatkan literasi, numerasi, dan kompetensi kunci; menghapus ujian nasional.",
    instruments: ["RPP ringkas", "Modul belajar mandiri", "Asesmen awal"],
    assessment:
      "Asesmen sederhana untuk memetakan kompetensi esensial; fokus pada kemajuan belajar, bukan ranking.",
  },
  {
    id: "paud_fondasi",
    name: "Kurikulum PAUD (Fase Fondasi)",
    description:
      "Kurikulum pendidikan anak usia dini yang berpusat pada tubuh dengan pembelajaran bermain (DIM: nilai agama-moral, fisik-motorik, kognitif, bahasa, sosial-emosional, dan seni).",
    instruments: ["Program semester", "RPPM", "Modul ajar bermuatan tema"],
    assessment:
      "Observasi perkembangan, anekdotal, dan karya anak; laporan perkembangan 6 aspek DIM.",
  },
  {
    id: "berbasis_cinta",
    name: "Kurikulum Berbasis Cinta (KBC)",
    description:
      "Inisiatif Kemenag (diluncurkan 25 Juli 2025, KMA No. 1503/2025) yang menempatkan kasih sayang, empati, dan nilai spiritual sebagai fondasi semua mata pelajaran — berlandaskan 5 nilai Panca Cinta menuju Madrasah/Sekolah Ramah Anak dan Ramah Lingkungan, diperkuat semangat cinta tanah air (hubbul wathan minal iman).",
    instruments: [
      "Modul ajar bermuatan Panca Cinta",
      "Budaya belajar berbasis cinta",
      "Projek penguatan profil lulusan",
    ],
    assessment:
      "Asesmen awal-formatif-sumatif; sikap dinilai melalui observasi penguatan nilai Panca Cinta dalam kegiatan belajar.",
  },
];

export const APPROACHES: ApproachInfo[] = [
  {
    id: "saintifik",
    name: "Pendekatan Saintifik",
    description:
      "Pendekatan pembelajaran yang mengikuti metode ilmiah: mengamati, menanya, mencoba, menalar, dan mengomunikasikan (5M).",
    implementation: [
      "Mengamati: pengamatan objek/bahan ajarnya yang konkret",
      "Menanya: pertanyaan pemantik dan berpikir kritis",
      "Mencoba: eksplorasi dan eksperimen",
      "Menalar: penalaran, analisis, dan penarikan kesimpulan",
      "Mengomunikasikan: presentasi dan publikasi hasil",
    ],
  },
  {
    id: "konstruktivisme",
    name: "Konstruktivisme",
    description:
      "Pengetahuan dibangun sendiri oleh peserta didik melalui pengalaman, bukan sekadar ditransfer guru (Piaget, Vygotsky).",
    implementation: [
      "Mengaitkan konsep baru dengan pengetahuan awal",
      "Memberi pengalaman konkret sebelum abstrak",
      "Diskusi dan negosiasi makna antarteman",
      "Refleksi atas perubahan konsep",
    ],
  },
  {
    id: "tpack",
    name: "TPACK",
    description:
      "Technological Pedagogical Content Knowledge: memadukan penguasaan konten, pedagogi, dan teknologi dalam satu pembelajaran.",
    implementation: [
      "Pilih teknologi yang menjelaskan konten sulit (simulasi, video)",
      "Gunakan LMS/kuis interaktif untuk umpan balik cepat",
      "Kreasikan produk digital sebagai bukti belajar",
    ],
  },
  {
    id: "crt",
    name: "Culturally Responsive Teaching (CRT)",
    description:
      "Pendekatan yang menjadikan budaya lokal dan pengalaman peserta didik sebagai pijakan belajar (kesadaran sosio-kultural).",
    implementation: [
      "Petakan budaya dan kearifan lokal sekitar sekolah",
      "Gunakan contoh, cerita, dan kasus dari budaya peserta didik",
      "Eksplisitaskan nilai sosial-emosional dalam kegiatan",
    ],
  },
  {
    id: "tarl",
    name: "TaRL (Teaching at the Right Level)",
    description:
      "Pembelajaran yang mengelompokkan peserta didik berdasarkan level kemampuan aktual (hasil asesmen), bukan usia atau kelas.",
    implementation: [
      "Asesmen awal untuk memetakan level membaca/berhitung",
      "Kelompok fleksibel sesuai level, dievaluasi berkala",
      "Fokus keterampilan dasar sebelum materi lanjutan",
    ],
  },
  {
    id: "steam",
    name: "STEAM",
    description:
      "Integrasi Science, Technology, Engineering, Arts, dan Mathematics dalam satu pengalaman belajar berbasis proyek/tantangan.",
    implementation: [
      "Rancang tantangan nyata lintas disiplin",
      "Sisipkan elemen seni untuk kreativitas",
      "Hargai proses iterasi: coba, gagal, perbaiki",
    ],
  },
  {
    id: "diferensiasi",
    name: "Pembelajaran Berdiferensiasi",
    description:
      "Menyesuaikan konten, proses, dan produk dengan kesiapan, minat, dan profil belajar peserta didik.",
    implementation: [
      "Diagnostik untuk memetakan kesiapan belajar",
      "Pilih konten/proses/produk yang berbeda per kelompok",
      "Asesmen fleksibel sesuai produk belajar",
    ],
  },
  {
    id: "deep_learning",
    name: "Pembelajaran Mendalam (Deep Learning)",
    description:
      "Pendekatan resmi Kemendikdasmen (2025) yang memuliakan belajar: suasana berkesadaran (mindful), bermakna (meaningful), dan menggembirakan (joyful) melalui olah pikir, olah hati, olah rasa, dan olah raga — menuju 8 dimensi profil lulusan.",
    implementation: [
      "Prinsip: berkesadaran, bermakna, menggembirakan",
      "Pengalaman belajar: memahami ? mengaplikasi ? merefleksi",
      "Kerangka: praktik pedagogis, kemitraan pembelajaran, lingkungan pembelajaran, pemanfaatan digital",
    ],
  },
];

export const MODELS: ModelInfo[] = [
  {
    id: "pembelajaran_mendalam",
    name: "Siklus Pembelajaran Mendalam (Deep Learning)",
    description:
      "Alur pengalaman belajar Pembelajaran Mendalam Kemendikdasmen 2025: memahami, mengaplikasi, dan merefleksi, dengan suasana berkesadaran, bermakna, dan menggembirakan.",
    rationale: "Membangun pemahaman utuh dan mendalam yang dipakai dalam kehidupan nyata, menuju 8 dimensi profil lulusan.",
    syntax: [
      "Memahami — membangun pengetahuan esensial secara berkesadaran (mindful)",
      "Mengaplikasi — menerapkan pengetahuan pada konteks nyata yang bermakna (meaningful)",
      "Merefleksi — mengevaluasi diri dan memaknai proses belajar dengan gembira (joyful)",
    ],
    suitedFor: ["PAUD", "SD", "SMP", "SMA", "SMK"],
  },
  {
    id: "pbl",
    name: "Problem Based Learning (PBL)",
    description:
      "Model berbasis masalah autentik: peserta didik menyelidiki, mencari solusi, dan menyajikan hasil secara sistematis.",
    rationale: "Melatih bernalar kritis dan pemecahan masalah pada situasi nyata.",
    syntax: [
      "Orientasi peserta didik pada masalah",
      "Mengorganisasikan peserta didik untuk belajar",
      "Membimbing penyelidikan individual maupun kelompok",
      "Mengembangkan dan menyajikan hasil karya",
      "Menganalisis dan mengevaluasi proses pemecahan masalah",
    ],
    suitedFor: ["SD", "SMP", "SMA", "SMK"],
  },
  {
    id: "pjbl",
    name: "Project Based Learning (PjBL)",
    description:
      "Model belajar melalui proyek nyata bermuatan tantangan, dari pertanyaan mendasar hingga presentasi produk.",
    rationale: "Menghasilkan produk nyata; menguatkan kolaborasi dan manajemen waktu.",
    syntax: [
      "Pertanyaan mendasar (essential question)",
      "Merancang perencanaan proyek",
      "Menyusun jadwal kegiatan",
      "Memonitor kemajuan proyek",
      "Menguji hasil dan refleksi",
      "Evaluasi pengalaman belajar",
    ],
    suitedFor: ["SD", "SMP", "SMA", "SMK"],
  },
  {
    id: "discovery",
    name: "Discovery Learning",
    description:
      "Model yang menuntun peserta didik menemukan konsep sendiri melalui rangkaian stimulasi hingga menarik kesimpulan.",
    rationale: "Penemuan mandiri membuat konsep lebih tahan lupa.",
    syntax: [
      "Stimulasi (pemberian rangsangan)",
      "Identifikasi masalah",
      "Pengumpulan data",
      "Pengolahan data",
      "Membuktikan hipotesis",
      "Menarik kesimpulan",
    ],
    suitedFor: ["SD", "SMP", "SMA"],
  },
  {
    id: "inquiry",
    name: "Inquiry Learning",
    description:
      "Model penyelidikan ilmiah: peserta didik merumuskan hipotesis, menguji lewat data, lalu menyimpulkan seperti peneliti.",
    rationale: "Memupuk cara berpikir ilmiah dan ketelitian.",
    syntax: [
      "Orientasi terhadap masalah",
      "Merumuskan hipotesis",
      "Mengumpulkan data melalui penyelidikan",
      "Menguji hipotesis",
      "Menyimpulkan",
      "Refleksi dan evaluasi",
    ],
    suitedFor: ["SMP", "SMA", "SMK"],
  },
  {
    id: "ctl",
    name: "Contextual Teaching & Learning (CTL)",
    description:
      "Pembelajaran kontekstual: menghubungkan materi dengan kehidupan nyata peserta didik (konstruktivisme, inquiry, QL, kolaborasi).",
    rationale: "Makna belajar muncul ketika materi relevan dengan kehidupan.",
    syntax: [
      "Konstruksi koneksi dari pengetahuan awal",
      "Menyelidiki fenomena nyata (inquiry)",
      "Belajar dalam konteks otentik",
      "Berkolaborasi dalam kelompok",
      "Berbagi hasil dan refleksi",
    ],
    suitedFor: ["SD", "SMP", "SMA", "SMK"],
  },
  {
    id: "cooperative",
    name: "Cooperative Learning",
    description:
      "Model pembelajaran kelompok dengan positive interdependence dan akuntabilitas individual (STAD, NHT, Teams Games Tournament).",
    rationale: "Kerja sama terstruktur menguatkan sosial-emosional dan penguasaan materi.",
    syntax: [
      "Membentuk kelompok heterogen",
      "Menyampaikan tujuan dan aturan kerja sama",
      "Membagikan tugas dengan ketergantungan positif",
      "Memonitor interaksi kelompok",
      "Presentasi dan penilaian individu",
      "Evaluasi proses gotong royong",
    ],
    suitedFor: ["SD", "SMP", "SMA", "SMK"],
  },
  {
    id: "flipped",
    name: "Flipped Classroom",
    description:
      "Materi dipelajari mandiri di rumah (video/bacaan); jam tatap muka dipakai untuk latihan dan bimbingan intensif.",
    rationale: "Waktu kelas efektif untuk penerapan, bukan ceramah.",
    syntax: [
      "Distribusi materi pra-kelas (video/bacaan)",
      "Asesmen awal pemahaman mandiri",
      "Diskusi dan pengerjaan latihan di kelas",
      "Bimbingan intensif oleh guru",
      "Refleksi dan penguatan konsep",
    ],
    suitedFor: ["SMP", "SMA", "SMK"],
  },
  {
    id: "problem_solving",
    name: "Problem Solving",
    description:
      "Model berfokus pada proses menyelesaikan masalah terstruktur: dari identifikasi hingga verifikasi solusi.",
    rationale: "Melatih pola pikir sistematis dan ketekunan (perseverance).",
    syntax: [
      "Identifikasi dan definisi masalah",
      "Merumuskan strategi penyelesaian",
      "Menerapkan strategi pada masalah nyata",
      "Memverifikasi dan menguji solusi",
      "Mereflektikan proses dan hasil",
    ],
    suitedFor: ["SD", "SMP", "SMA"],
  },
];

export const METHODS: MethodInfo[] = [
  { id: "ceramah_interaktif", name: "Ceramah Interaktif", description: "Penjelasan lisan dua arah dengan variasi pertanyaan dan tanggapan peserta didik.", whenToUse: "Materi teoretis yang butuh klarifikasi langsung dari guru." },
  { id: "diskusi", name: "Diskusi Kelompok", description: "Pertukaran gagasan terstruktur dalam kelompok kecil menuju kesepakatan bersama.", whenToUse: "Materi yang menuntut penalaran dan pertukaran pandangan." },
  { id: "tanya_jawab", name: "Tanya Jawab", description: "Dialog berpola kisi-kisi pertanyaan guru dan respons peserta didik.", whenToUse: "Menggali pengetahuan awal atau mengonfirmasi pemahaman." },
  { id: "demonstrasi", name: "Demonstrasi", description: "Peragaan proses atau keterampilan oleh guru/peserta didik diikuti tiruan.", whenToUse: "Keterampilan psikomotorik atau prosedur yang perlu diperagakan." },
  { id: "eksperimen", name: "Eksperimen", description: "Percobaan sistematis dengan variabel terkontrol dan pencatatan data.", whenToUse: "Materi sains dan matematika yang bisa diuji secara nyata." },
  { id: "penugasan", name: "Penugasan / Resitasi", description: "Tugas individual atau kelompok yang dilaporkan kembali untuk dibahas.", whenToUse: "Memperdalam penguasaan materi melalui latihan mandiri." },
  { id: "role_playing", name: "Role Playing", description: "Bermain peran situasi nyata untuk memahami perspektif pihak-pihak di dalamnya.", whenToUse: "Materi sosial, bahasa, dan literasi emosi." },
  { id: "jigsaw", name: "Jigsaw", description: "Setiap anggota menguasai satu bagian materi lalu mengajarkannya ke kelompok asal.", whenToUse: "Materi yang mudah dipecah menjadi bagian mandiri." },
  { id: "simulasi", name: "Simulasi", description: "Peniruan proses nyata dalam situasi yang disederhanakan.", whenToUse: "Konteks yang sulit dihadirkan langsung di kelas." },
  { id: "gallery_walk", name: "Gallery Walk", description: "Karya dipajang dan peserta didik berkeliling memberi tanggapan pada tiap karya.", whenToUse: "Mereview dan mengapresiasi hasil kerja banyak kelompok." },
  { id: "karyawisata", name: "Karyawisata", description: "Pengamatan langsung di luar kelas (museum, sungai, pasar, UMKM) untuk konteks nyata.", whenToUse: "Materi yang butuh observasi lingkungan sesungguhnya." },
  { id: "drill", name: "Drill / Latihan Terstruktur", description: "Latihan berulang dengan umpan balik cepat hingga keterampilan menjadi otomatis.", whenToUse: "Fondasi keterampilan: membaca, berhitung, kosakata." },
];

export const STRATEGIES: StrategyInfo[] = [
  { id: "active_learning", name: "Active Learning", description: "Melibatkan peserta didik aktif secara fisik, emosional, dan kognitif dalam setiap kegiatan.", whenToUse: "Menjaga keterlibatan sepanjang sesi pembelajaran." },
  { id: "scaffolding", name: "Scaffolding", description: "Bantuan bertahap yang dikurangi seiring meningkatnya kemampuan peserta didik (Vygotsky ZPD).", whenToUse: "Materi baru yang menantang bagi kelompok awal belajar." },
  { id: "peer_tutoring", name: "Peer Tutoring", description: "Teman sebaya yang sudah menguasai menjadi tutor bagi teman lainnya.", whenToUse: "Kelas heterogen; penguatan keterampilan dasar." },
  { id: "mind_mapping", name: "Mind Mapping", description: "Memvisualisasikan konsep dan hubungannya dalam peta pikiran.", whenToUse: "Merangkum dan menghubungkan banyak konsep sekaligus." },
  { id: "gamifikasi", name: "Gamifikasi", description: "Elemen permainan (poin, level, lencana, tantangan) dipakai pada aktivitas belajar.", whenToUse: "Meningkatkan motivasi pada latihan dan pengulangan." },
  { id: "think_pair_share", name: "Think-Pair-Share", description: "Berpikir mandiri, berdiskusi berpasangan, lalu berbagi ke kelas.", whenToUse: "Pertanyaan reflektif yang butuh pengolahan gagasan." },
  { id: "nht", name: "Numbered Heads Together", description: "Nomor anggota kelompok ditunjuk acak untuk menjawab, mendorong semua anggota siap.", whenToUse: "Memastikan partisipasi merata dalam kerja kelompok." },
  { id: "jurnal_reflektif", name: "Jurnal Reflektif", description: "Peserta didik menuliskan pemahaman, hambatan, dan rencana belajar berikutnya.", whenToUse: "Menutup pembelajaran dan memantau perkembangan metakognitif." },
];

// 8 Dimensi Profil Lulusan — Permendikdasmen No. 13/2025 (menggantikan 6 dimensi Profil Pelajar Pancasila)
export const GRADUATE_DIMENSIONS: { name: string; description: string }[] = [
  {
    name: "Keimanan dan Ketakwaan kepada Tuhan YME",
    description: "Keyakinan kuat, mengamalkan ajaran agama, berakhlak mulia, menjaga hubungan dengan Tuhan, sesama, dan lingkungan.",
  },
  {
    name: "Kewargaan",
    description: "Bangga identitas dan budaya, menghargai keberagaman, menjaga persatuan, taat hukum, dan peduli keberlanjutan lingkungan.",
  },
  {
    name: "Penalaran Kritis",
    description: "Berpikir logis, analitis, rasa ingin tahu tinggi, serta mahir literasi dan numerasi untuk memecahkan masalah.",
  },
  {
    name: "Kreativitas",
    description: "Bersikap produktif, menciptakan inovasi, dan merumuskan solusi atas permasalahan di lingkungan sekitar.",
  },
  {
    name: "Kolaborasi",
    description: "Membiasakan diri peduli, berbagi, dan membangun kerja sama yang efektif dengan berbagai kalangan.",
  },
  {
    name: "Kemandirian",
    description: "Bertanggung jawab, berinisiatif, dan mampu beradaptasi dalam pembelajaran serta pengembangan diri.",
  },
  {
    name: "Kesehatan",
    description: "Hidup bersih dan sehat, memahami kebugaran fisik dan mental, serta berkontribusi positif terhadap lingkungan.",
  },
  {
    name: "Komunikasi",
    description: "Mahir menyimak, membaca, berbicara, dan menulis dengan baik, benar, dan beretika dalam beragam moda.",
  },
];

// 5 nilai Panca Cinta — landasan Kurikulum Berbasis Cinta (Kemenag, KMA No. 1503/2025)
export const PANCA_CINTA: { name: string; description: string }[] = [
  {
    name: "Cinta kepada Allah Swt. dan Rasul-Nya",
    description: "Keimanan dan ketakwaan sebagai muara kehidupan; meneladani sifat-sifat Allah dan teladan Nabi.",
  },
  {
    name: "Cinta kepada Ilmu Pengetahuan",
    description: "Ilmu sebagai alat transformasi sosial dan penuntun keseimbangan hidup; literasi dan penalaran kritis.",
  },
  {
    name: "Cinta kepada Diri Sendiri",
    description: "Kesehatan mental, harga diri, dan penguasaan keterampilan sosial-emosional.",
  },
  {
    name: "Cinta kepada Sesama",
    description: "Ukhuwah, empati, dan toleransi dalam keragaman.",
  },
  {
    name: "Cinta kepada Lingkungan",
    description: "Kesadaran ekologis dan tanggung jawab menjaga keberlangsungan alam.",
  },
];

// Level kognitif taksonomi Bloom (revisi) untuk kisi-kisi soal sumatif
export const COGNITIVE_LEVELS: { id: string; name: string }[] = [
  { id: "C1", name: "C1 — Mengingat" },
  { id: "C2", name: "C2 — Memahami" },
  { id: "C3", name: "C3 — Menerapkan" },
  { id: "C4", name: "C4 — Menganalisis" },
  { id: "C5", name: "C5 — Mengevaluasi" },
  { id: "C6", name: "C6 — Mencipta" },
];

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  pilihan_ganda: "Pilihan Ganda",
  uraian: "Uraian",
  isian: "Isian Singkat",
  menjodohkan: "Menjodohkan",
  uraian_terbuka: "Uraian Terbuka (HOTS)",
};

export const LEVELS: LevelInfo[] = [
  {
    id: "PAUD",
    label: "PAUD",
    grades: [
      { grade: "Kelompok Bermain", phase: "Fondasi" },
      { grade: "TK A", phase: "Fondasi" },
      { grade: "TK B", phase: "Fondasi" },
    ],
  },
  {
    id: "SD",
    label: "SD",
    grades: [
      { grade: "1", phase: "A" },
      { grade: "2", phase: "A" },
      { grade: "3", phase: "B" },
      { grade: "4", phase: "B" },
      { grade: "5", phase: "C" },
      { grade: "6", phase: "C" },
    ],
  },
  {
    id: "SMP",
    label: "SMP/MTs",
    grades: [
      { grade: "7", phase: "D" },
      { grade: "8", phase: "D" },
      { grade: "9", phase: "D" },
    ],
  },
  {
    id: "SMA",
    label: "SMA",
    grades: [
      { grade: "10", phase: "E" },
      { grade: "11", phase: "F" },
      { grade: "12", phase: "F" },
    ],
  },
  {
    id: "SMK",
    label: "SMK",
    grades: [
      { grade: "10", phase: "E" },
      { grade: "11", phase: "F" },
      { grade: "12", phase: "F" },
    ],
  },
];

export const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  PAUD: ["Nilai Agama dan Moral", "Fisik Motorik", "Kognitif", "Bahasa", "Sosial Emosional", "Seni"],
  SD: [
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Matematika",
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    "Bahasa Inggris",
    "Seni Budaya",
    "PJOK",
    "Pendidikan Agama dan Budi Pekerti",
  ],
  SMP: [
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Matematika",
    "IPA (Fisika)",
    "IPA (Biologi)",
    "IPS",
    "Informatika",
    "PJOK",
    "Seni Budaya",
    "Pendidikan Agama dan Budi Pekerti",
  ],
  SMA: [
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Matematika Lanjut",
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Geografi",
    "Sejarah",
    "Ekonomi",
    "Sosiologi",
    "Informatika",
    "PJOK",
    "Seni Budaya",
    "Pendidikan Agama dan Budi Pekerti",
  ],
  SMK: [
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Matematika",
    "Informatika",
    "Projek IPAS",
    "Projek Kreatif dan Kewirausahaan",
    "Kejuruan / Konsentrasi Keahlian",
    "PJOK",
    "Pendidikan Agama dan Budi Pekerti",
  ],
};

export function findCurriculum(id: string): CurriculumInfo | undefined {
  return CURRICULA.find((c) => c.id === id);
}
export function findApproach(id: string): ApproachInfo | undefined {
  return APPROACHES.find((a) => a.id === id);
}
export function findModel(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id);
}
export function findMethod(id: string): MethodInfo | undefined {
  return METHODS.find((m) => m.id === id);
}
export function findStrategy(id: string): StrategyInfo | undefined {
  return STRATEGIES.find((s) => s.id === id);
}
export function findLevel(id: string): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === id);
}
