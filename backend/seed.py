"""Idempotent seed: demo guru account + realistic sample perangkat pembelajaran documents.

Run: cd /app/backend && python seed.py
"""

import asyncio
import uuid
from datetime import datetime, timezone

from lib.db import client, db, ensure_indexes
from lib.security import hash_password

DEMO_EMAIL = "guru@sekolah.id"
DEMO_PASSWORD = "demo1234"

now = datetime.now(timezone.utc)


def _doc(owner_id: str, **fields) -> dict:
    base = {
        "id": str(uuid.uuid4()),
        "owner_id": owner_id,
        "created_at": now,
        "updated_at": now,
        "status": "final",
        "objectives": [],
        "dimensions": [],
        "core_activities": [],
        "kktp_intervals": [],
        "atp_entries": [],
        "kkm_score": None,
    }
    base.update(fields)
    return base


async def seed_demo_user() -> str:
    existing = await db.users.find_one({"email": DEMO_EMAIL})
    if existing:
        return existing["id"]
    user = {
        "id": str(uuid.uuid4()),
        "name": "Sari Wulandari, S.Pd.",
        "email": DEMO_EMAIL,
        "password_hash": hash_password(DEMO_PASSWORD),
        "school": "SD Negeri 1 Harapan Bangsa",
        "nip": "19790812 200604 1 002",
        "created_at": now,
    }
    await db.users.insert_one(user)
    return user["id"]


async def seed_documents(owner_id: str) -> None:
    if await db.documents.count_documents({"owner_id": owner_id}) > 0:
        return

    documents = [
        _doc(
            owner_id,
            doc_type="modul_ajar",
            title="Modul Ajar Pecahan Senilai — PBL Fase B",
            curriculum="merdeka",
            level="SD",
            grade="3",
            phase="B",
            subject="Matematika",
            time_allocation="2 x 35 menit",
            academic_year="2025/2026",
            teacher_name="Sari Wulandari, S.Pd.",
            teacher_nip="19790812 200604 1 002",
            school_name="SD Negeri 1 Harapan Bangsa",
            approach="saintifik",
            model="pbl",
            method="diskusi",
            strategy="scaffolding",
            cp="Peserta didik mampu memahami pecahan sebagai bagian dari kesatuan serta membandingkan pecahan senilai pada model area dan garis bilangan.",
            objectives=[
                "Menjelaskan konsep pecahan senilai menggunakan benda konkret",
                "Menemukan hubungan 1/2, 2/4, dan 4/8 melalui peragaan kertas lipat",
                "Menyelesaikan masalah sehari-hari yang berkaitan dengan pecahan senilai",
            ],
            dimensions=["Penalaran Kritis", "Kolaborasi"],
            meaningful_understanding="Pecahan senilai membantu kita membagi sesuatu secara adil meski ukurannya berbeda-beda.",
            trigger_questions="Bagaimana cara membagi satu kue bolu untuk 4 orang agar setiap bagian terasa sama besar?",
            intro_activities="Apersepsi membagi kue; menyampaikan tujuan pembelajaran; asesmen diagnostik singkat tentang pecahan dasar.",
            core_activities=[
                {"phase": "Orientasi peserta didik pada masalah", "description": "Guru menyajikan masalah membagi kue untuk 4 teman yang memiliki selera porsi berbeda.", "duration_min": 10},
                {"phase": "Mengorganisasikan peserta didik untuk belajar", "description": "Peserta didik dibagi kelompok 4 orang dan menerima LKPD serta kertas origami.", "duration_min": 5},
                {"phase": "Membimbing penyelidikan individual maupun kelompok", "description": "Kelompok melipat kertas menjadi 2, 4, dan 8 bagian lalu membandingkan ukuran bagian.", "duration_min": 25},
                {"phase": "Mengembangkan dan menyajikan hasil karya", "description": "Perwakilan kelompok mempresentasikan temuan pola pecahan senilai di depan kelas.", "duration_min": 15},
                {"phase": "Menganalisis dan mengevaluasi proses pemecahan masalah", "description": "Guru memandu refleksi pola 1/2 = 2/4 = 4/8 dan menegaskan konsep.", "duration_min": 15},
            ],
            closing_activities="Menyimpulkan bersama; refleksi 'apa yang paling mudah/sulit'; umpan balik; doa penutup.",
            diagnostic_assessment="Tanya jawab lisan mengenai pecahan sederhana (1/2, 1/4).",
            formative_assessment="Observasi diskusi kelompok dan LKPD berbasis rubrik.",
            summative_assessment="Tes tertulis 5 soal uraian pecahan senilai.",
            media="Kertas origami, kartu pecahan, garis bilangan di papan tulis",
            sources="Buku Matematika SD Kelas III Kemendikbudristek; LKPD 1 Pecahan Senilai",
            remedial="Bimbingan individual dengan peragaan kartu pecahan.",
            enrichment="Tantangan menemukan 3 pecahan senilai lain dari 3/6.",
        ),
        _doc(
            owner_id,
            doc_type="rpp",
            title="RPP Zat dan Perubahannya — Inquiry Learning",
            curriculum="k13",
            level="SMP",
            grade="7",
            subject="IPA (Fisika)",
            time_allocation="3 x 40 menit",
            academic_year="2025/2026",
            teacher_name="Budi Santoso, S.Pd.",
            teacher_nip="19850310 201001 1 003",
            school_name="SMP Negeri 2 Cendekia",
            approach="saintifik",
            model="inquiry",
            method="eksperimen",
            strategy="active learning",
            cp="Menganalisis sifat zat dan perubahan wujudnya berdasarkan hasil percobaan sederhana.",
            objectives=[
                "Menyimpulkan perbedaan perubahan wujud melebur dan menguap dari hasil percobaan",
                "Menyajikan data hasil percobaan dalam tabel dan grafik sederhana",
                "Menunjukkan sikap teliti dan kerja sama saat melakukan percobaan",
            ],
            meaningful_understanding="Perubahan wujud zat terjadi di sekitar kita setiap hari, dari es mencair hingga pakaian mengering.",
            trigger_questions="Mengapa es batu mencair saat dibiarkan di suhu ruang, dan ke mana 'air' itu pergi jika terus dipanaskan?",
            intro_activities="Menanyakan pengalaman peserta didik tentang es mencair; menyampaikan KD, tujuan, dan langkah keselamatan kerja.",
            core_activities=[
                {"phase": "Orientasi terhadap masalah", "description": "Guru mengajukan pertanyaan pemantik tentang perubahan wujud es dan air.", "duration_min": 10},
                {"phase": "Merumuskan hipotesis", "description": "Peserta didik menuliskan dugaan awal tentang penyebab es mencair dan air menguap.", "duration_min": 10},
                {"phase": "Mengumpulkan data melalui penyelidikan", "description": "Kelompok melakukan percobaan pemanasan es sambil mencatat suhu setiap 2 menit.", "duration_min": 50},
                {"phase": "Menguji hipotesis", "description": "Kelompok membandingkan data suhu dengan hipotesis awal dan mendiskusikan kesesuaiannya.", "duration_min": 30},
                {"phase": "Menyimpulkan", "description": "Peserta didik menyimpulkan titik lebur dan titik didih dari grafik pemanasan.", "duration_min": 20},
            ],
            closing_activities="Presentasi singkat hasil percobaan; penguatan konsep oleh guru; refleksi dan tindak lanjut.",
            diagnostic_assessment="Tanya jawab tentang wujud zat: padat, cair, gas.",
            formative_assessment="Penilaian LKPD percobaan dan keterampilan proses sains.",
            summative_assessment="Tes tulis pilihan ganda dan uraian tentang perubahan wujud.",
            media="Es batu, beker glass, termometer, pembakar spiritus, LKPD percobaan",
            sources="Buku IPA Kelas VII Kurikulum 2013 Kemendikbud; PhET States of Matter",
            remedial="Percobaan ulang sederhana melebur lilin dengan pendampingan guru.",
            enrichment="Menyelidiki mengapa nasi matang menguap lebih cepat di dataran tinggi.",
            kkm_score=75,
        ),
        _doc(
            owner_id,
            doc_type="modul_ajar",
            title="Modul Ajar Algoritma & Pemrograman — PjBL Fase E",
            curriculum="merdeka",
            level="SMA",
            grade="10",
            phase="E",
            subject="Informatika",
            time_allocation="3 x 45 menit",
            academic_year="2025/2026",
            teacher_name="Rina Kartika, S.Kom.",
            teacher_nip="-",
            school_name="SMA Negeri 3 Nusantara",
            approach="tpack",
            model="pjbl",
            method="penugasan",
            strategy="gamifikasi",
            cp="Peserta didik mampu merancang dan mengimplementasikan program sederhana dengan alur logika (sekuens, percabangan, perulangan) untuk memecahkan masalah kontekstual.",
            objectives=[
                "Merancang algoritma dalam bentuk flowchart untuk masalah sehari-hari",
                "Mengimplementasikan algoritma menjadi program Python sederhana",
                "Menguji dan mempresentasikan program kelompok",
            ],
            dimensions=["Kreativitas", "Kemandirian", "Penalaran Kritis"],
            meaningful_understanding="Algoritma adalah cara berpikir runtut untuk menyelesaikan masalah, bukan sekadar menulis kode.",
            trigger_questions="Bagaimana aplikasi kasir mengetahui total belanja dan kembalian secara otomatis?",
            intro_activities="Ice breaking 'robot guru'; menyampaikan tujuan; memperkenalkan proyek mini 'Kalkulator Kasir'.",
            core_activities=[
                {"phase": "Pertanyaan mendasar (essential question)", "description": "Peserta didik menggali masalah nyata yang bisa diselesaikan program kasir sederhana.", "duration_min": 10},
                {"phase": "Merancang perencanaan proyek", "description": "Kelompok menyusun flowchart dan pembagian tugas pengkodean.", "duration_min": 25},
                {"phase": "Menyusun jadwal kegiatan", "description": "Kelompok menyepakati milestone: algoritma, kode, uji, presentasi.", "duration_min": 10},
                {"phase": "Memonitor kemajuan proyek", "description": "Guru berkeliling memeriksa progres dan memberi scaffolding pemrograman.", "duration_min": 45},
                {"phase": "Menguji hasil dan refleksi", "description": "Kelompok saling menguji program dengan kasus uji dan merevisi kode.", "duration_min": 25},
                {"phase": "Evaluasi pengalaman belajar", "description": "Presentasi program; guru menilai dengan rubrik proyek dan merangkum konsep.", "duration_min": 20},
            ],
            closing_activities="Refleksi proses proyek; pengisian jurnal belajar; apresiasi kelompok terbaik.",
            diagnostic_assessment="Kuis singkat sekuens dan percabangan.",
            formative_assessment="Rubrik proyek (algoritma 30%, kode 40%, kerja sama 30%).",
            summative_assessment="Ujian praktik membuat program sederhana sesuai spesifikasi.",
            media="Laptop dengan Python/Thonny, papan tulis, contoh flowchart",
            sources="Modul Informatika SMA Fase E Kemendikbudristek; dokumentasi Python resmi",
            remedial="Pendampingan menulis ulang program dari flowchart yang sudah tersedia.",
            enrichment="Menambahkan fitur diskon dan PPN pada program kasir.",
        ),
        _doc(
            owner_id,
            doc_type="atp",
            title="ATP Bahasa Indonesia Fase D — Teks Naratif",
            curriculum="merdeka",
            level="SMP",
            grade="7",
            phase="D",
            subject="Bahasa Indonesia",
            time_allocation="1 semester",
            academic_year="2025/2026",
            teacher_name="Sari Wulandari, S.Pd.",
            school_name="SMP Negeri 2 Cendekia",
            approach="crt",
            method="diskusi",
            strategy="scaffolding",
            cp="Peserta didik mampu memahami, menafsirkan, dan menyajikan teks naratif serta teks nonfiksi untuk tujuan komunikatif.",
            atp_entries=[
                {"order": 1, "objective": "Mengidentifikasi struktur teks cerita fantasi", "content": "Orientasi, komplikasi, resolusi pada cerita rakyat Nusantara"},
                {"order": 2, "objective": "Menentukan makna kata dan ungkapan dalam teks naratif", "content": "Kata bermakna denotatif-konotatif dan ungkapan khas daerah"},
                {"order": 3, "objective": "Menganalisis nilai dan pesan moral cerita rakyat", "content": "Kaitan nilai kearifan lokal dengan budaya peserta didik"},
                {"order": 4, "objective": "Menyusun kerangka cerita fantasi orisinal", "content": "Penokohan, latar, dan alur cerita berbasis budaya lokal"},
                {"order": 5, "objective": "Menulis cerita fantasi dengan struktur lengkap", "content": "Pengembangan kerangka menjadi cerita 3 paragraf atau lebih"},
                {"order": 6, "objective": "Memresentasikan cerita secara menarik", "content": "Teknik storytelling dan penilaian antarteman"},
            ],
            meaningful_understanding="Cerita rakyat adalah jendela nilai budaya yang bisa dikisahkan ulang dengan cara kita.",
        ),
        _doc(
            owner_id,
            doc_type="kktp",
            title="KKTP Biologi Fase F — Ekosistem",
            curriculum="merdeka",
            level="SMA",
            grade="11",
            phase="F",
            subject="Biologi",
            time_allocation="1 pertemuan asesmen",
            academic_year="2025/2026",
            teacher_name="Rina Kartika, S.Kom.",
            school_name="SMA Negeri 3 Nusantara",
            approach="tarl",
            cp="Peserta didik mampu menganalisis interaksi antarkomponen ekosistem serta dampak perubahan lingkungan terhadap keseimbangan ekosistem.",
            objectives=[
                "Menganalisis hubungan antar-jaring-jaring makanan dalam ekosistem",
                "Mengevaluasi dampak gangguan manusia terhadap keseimbangan ekosistem",
            ],
            kkm_score=76,
            kktp_intervals=[
                {"range_label": "0 – 60", "description": "Belum mencapai tujuan — perlu bimbingan intensif dan asesmen ulang"},
                {"range_label": "61 – 75", "description": "Cukup — perlu penguatan pada konsep jaring-jaring makanan"},
                {"range_label": "76 – 90", "description": "Mencapai KKTP — kompetensi tercapai penuh"},
                {"range_label": "91 – 100", "description": "Melampaui KKTP — perlu pengayaan studi kasus ekosistem lokal"},
            ],
        ),
    ]

    await db.documents.insert_many(documents)


async def main() -> None:
    await ensure_indexes()
    owner = await seed_demo_user()
    await seed_documents(owner)
    print(f"Seed OK — demo guru: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
