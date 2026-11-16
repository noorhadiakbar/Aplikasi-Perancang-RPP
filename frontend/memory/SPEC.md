# SPEC — PerancangRPP (Sistem Desain Perangkat Pembelajaran Indonesia)

## Apa aplikasi ini
Aplikasi web multi-guru untuk merancang perangkat pembelajaran Indonesia: **Modul Ajar (Kurikulum Merdeka), RPP (K13), ATP, dan KKTP/KKM**. Guru login, mengisi wizard 6 langkah (identitas ? pilihan pedagogis ? CP/TP ? langkah pembelajaran ? asesmen & media ? pratinjau), lalu menyimpan dan mencetak dokumen format A4. Taksonomi pedagogi (kurikulum/pendekatan/model/metode/strategi) hidup sebagai data statis frontend (`src/lib/pedagogy.ts`) — dropdown, auto-sintaks, dan Ensiklopedia Pedagogi tetap berfungsi bahkan tanpa backend (static CDN build).

## Stack & pola
- Backend: FastAPI (`backend/server.py`), semua route pada `api_router` (prefix `/api`); routers di `backend/routers/` (auth, documents); models Pydantic v2 di `backend/models/` (auth, document); Mongo via motor `lib/db` (INDEXES untuk users/sessions/documents).
- Frontend: React 19 + TS strict + Tailwind v4 + shadcn base-nova; fetch via `src/lib/api.ts`; data via TanStack Query; sesi httpOnly cookie — `lib/session.ts` (`beginSession`/`endSession`) memegang cache invalidation.
- TS mirrors: `src/lib/types.ts` ? `models/auth.py` + `models/document.py` (manual sync).

## Data model (Mongo `app` db)
- `users`: id(uuid str), name, email (unique), password_hash (pbkdf2_sha256), school, nip
- `sessions`: token (unique), user_id, expires_at (aware UTC) — cookie `session`, 30 hari, httponly
- `documents`: id, owner_id, doc_type (modul_ajar|rpp|atp|kktp|sumatif), title, curriculum (merdeka|k13|darurat|paud_fondasi|berbasis_cinta), level (PAUD|SD|SMP|SMA|SMK), grade, phase, subject, time_allocation, academic_year, teacher_name/nip, school_name, approach (termasuk deep_learning = Pembelajaran Mendalam), model, method, strategy, cp, objectives[], dimensions[] (8 Dimensi Profil Lulusan — Permendikdasmen 13/2025), panca_cinta[] (5 nilai KBC), meaningful_understanding, trigger_questions, intro_activities, core_activities[{phase, description, duration_min}], closing_activities, diagnostic/formative/summative_assessment, media, sources, remedial, enrichment, source_document_id (rujukan modul/RPP untuk soal sumatif), exam_duration, assessment_items[{order, objective, indicator, cognitive_level, content, question_type, question, answer, points}] (kisi-kisi & soal sumatif), scoring_rubric[{criterion, excellent, good, adequate, needs_guidance}] (rubrik 4 level), kkm_score, kktp_intervals[{range_label, description}], atp_entries[{order, objective, content}], status, created_at, updated_at

## Endpoints (/api)
- `POST /auth/register` (409 email duplikat), `POST /auth/login` (401 kredensial salah), `GET /auth/me` (401 tamu), `POST /auth/logout`
- `GET /documents?doc_type=&level=&q=` (milik owner saja), `POST /documents` (201), `GET/PUT/DELETE /documents/{id}` (404 milik orang lain; DELETE 204; body salah 422)
- `POST /assessments/generate` (auth) — AI (Claude Opus 5.5 via EMERGENT_LLM_KEY, fallback Claude Sonnet 5.5) menyusun kisi-kisi + soal + kunci + rubrik dari CP/TP/isi modul; 422 jika CP & TP kosong; 502 jika AI gagal. ±30–60 detik.
- `GET /` (hello), `POST/GET /status` (template, tak dipakai UI)

## Flow utama
Landing (`/`) ? login/register ? Dashboard (filter jenis/jenjang, pencarian judul, edit/cetak/hapus) ? Designer (`/designer`, `/designer/:id` untuk edit; query param `?model=pbl` dll. dari Ensiklopedia) ? wizard: Auto-susun Sintaks mengisi Kegiatan Inti dari sintaks model terpilih ? "Simpan & Buka Cetak" ? `/document/:id/print` (A4 + window.print dengan @media print). Reference (`/reference`) publik, data statis.

## Fitur kurikulum terbaru
- Pendekatan `deep_learning` (Pembelajaran Mendalam: berkesadaran/bermakna/menggembirakan) + model `pembelajaran_mendalam` (sintaks memahami?mengaplikasi?merefleksi, dipakai Auto-susun Sintaks).
- Kurikulum `berbasis_cinta` (KBC Kemenag 2025): checkbox 5 Panca Cinta muncul di wizard langkah 3, dicetak sebagai bagian D2.
- Dokumen `sumatif`: wizard langkah 5 = SumatifEditor (rujukan modul ? salin identitas/CP/TP, jenis Akhir Semester/Akhir Jenjang/Lingkup Materi, tombol AI, editor butir & rubrik); cetak: identitas, kisi-kisi, naskah soal (PG & uraian), kunci & pedoman penskoran, rubrik 4 level.

## Profil sekolah, backup, LKPD
- `users` juga menyimpan profil: school_address, npsn, city, principal_name, principal_nip, logo (data URL PNG/JPG/WEBP = ~300KB, diperkecil ke 256px di browser). `PUT /api/auth/profile` (422 untuk logo bukan data:image). Halaman `/profile` (Profil & Backup). Kop dokumen = logo + nama sekolah + alamat + NPSN; tanda tangan = Kepala Sekolah (nama/NIP) + kota.
- Backup: `GET /api/backup/export.json` (attachment: profil + documents + lkpd_submissions), `POST /api/backup/import` (gabung: id milik sendiri ? update, lainnya ? insert; 422 jika `app` ? "PerancangRPP"; profil hanya mengisi field kosong), `GET /api/backup/export.xlsx` (sheet Dokumen, Kisi-Kisi & Soal, Nilai LKPD). Arsip offline .html dibuat di browser (`lib/offlineExport.ts`: renderToStaticMarkup DocumentSheet + CSS di-inline).
- LKPD (`doc_type=lkpd`): soal di assessment_items (editor sama dengan sumatif, bisa AI), KKTP di kkm_score + kktp_intervals. Guru memasukkan jawaban siswa di `/lkpd/:id/nilai`: `POST /api/lkpd/{id}/grade` ? PG dicocokkan huruf kunci, isian/menjodohkan dicocokkan teks ternormalisasi, uraian dinilai AI (rubrik + kunci; gagal ? graded_by "perlu_guru", skor 0). Nilai = total/maks × 100; tuntas jika = kkm (default 75); interval KKTP dicocokkan dari range_label. `GET /api/lkpd/{id}/submissions`, `PUT /api/lkpd/submissions/{sid}` (koreksi guru ? graded_by "guru", hitung ulang), `DELETE`. Koleksi `lkpd_submissions`.

## Rekap, Word, input massal, pengingat backup
- Word: `GET /api/documents/{id}/export.docx` (python-docx, `lib/docx_export.py`; semua 6 jenis dokumen, kop + logo + tanda tangan dari profil). Tombol "Word" di kartu dasbor, halaman cetak, dan halaman nilai LKPD.
- LKPD `/lkpd/:id/nilai` punya 3 tab: Nilai Per Siswa | Input Massal (Excel) | Rekap Kelas. Input massal: tempel baris TSV dari Excel (Nama, Kelas, Jawaban No 1..N; baris header "Nama…" & "Contoh Siswa" diabaikan) ? `POST /api/lkpd/{id}/grade-bulk` {students: GradeIn[]} (1–60 siswa, AI uraian paralel maks 4). Template: `GET /api/lkpd/{id}/template.xlsx`. Rekap (frontend, recharts): statistik, pie ketuntasan, bar sebaran interval KKTP, bar capaian per butir, daftar siswa remedial (butir belum tuntas + tindak lanjut KKTP), tabel peringkat; filter kelas.
- Pengingat backup: `users.last_backup_at` di-set oleh export.json / export.xlsx / `POST /api/backup/mark` (dipanggil setelah arsip .html). `GET /api/backup/status` ? {last_backup_at, days_since, due (null atau =30 hari), reminder_days}. Banner kuning di dasbor bila due.

## Seed / kredensial
`backend/seed.py` (idempoten) — kredensial di `memory/test_credentials.md`. 8 dokumen contoh: Modul Ajar Matematika SD Fase B (PBL), RPP IPA SMP K13 (Inquiry), Modul Ajar Informatika SMA Fase E (PjBL), ATP Bahasa Indonesia SMP Fase D, KKTP Biologi SMA Fase F, Modul Ajar IPAS SMP — Pembelajaran Mendalam (Deep Learning), Modul Ajar KBC PAUD (dengan nilai Panca Cinta), dan Kisi-Kisi & Soal Sumatif Matematika (terhubung via source_document_id ke modul ajar matematika, berisi kisi-kisi 4 butir soal + kunci + rubrik penilaian 4 level).

## Deviasi spesifik yang diketahui
- `GET /auth/me` dipanggil sebagai probe tamu ? 401 di console saat belum login; itu perilaku dirancang (non-gating), halaman tamu tetap render penuh.
- Taksonomi pedagogi statis di frontend (bukan koleksi Mongo) — disengaja agar dropdown/reference bekerja di static preview tanpa backend.
