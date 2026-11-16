import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  FileSpreadsheet,
  Printer,
  Route,
  Sparkles,
} from "lucide-react";
import { fetchMe } from "@/lib/auth";
import { APPROACHES, CURRICULA, METHODS, MODELS, STRATEGIES } from "@/lib/pedagogy";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DOC_CARDS = [
  {
    icon: ClipboardList,
    title: "Modul Ajar",
    desc: "RPP Plus Kurikulum Merdeka: CP, TP, langkah per sintaks model, asesmen, dan lernumgebung dalam satu dokumen.",
    accent: "bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]",
  },
  {
    icon: BookOpenCheck,
    title: "RPP K13",
    desc: "Rencana Pelaksanaan Pembelajaran Kurikulum 2013 berbasis KI/KD dengan pendekatan Saintifik 5M.",
    accent: "bg-[#ECFDF5] text-[#064E3B] border-[#A7F3D0]",
  },
  {
    icon: Route,
    title: "ATP",
    desc: "Alur Tujuan Pembelajaran: rangkaian TP yang logis dan sistematis untuk mencapai CP dalam satu fase.",
    accent: "bg-amber-50 text-amber-900 border-amber-200",
  },
  {
    icon: FileSpreadsheet,
    title: "KKTP / KKM",
    desc: "Kriteria ketercapaian tujuan pembelajaran beserta interval nilai dan deskriptor kriteria per Permendikbudristek.",
    accent: "bg-rose-50 text-rose-900 border-rose-200",
  },
  {
    icon: Sparkles,
    title: "Kisi-Kisi & Soal Sumatif",
    desc: "Asesmen Sumatif Akhir Semester/Jenjang: kisi-kisi, soal, kunci, dan rubrik disusun AI dari CP, TP, dan isi modul Anda.",
    accent: "bg-teal-50 text-teal-900 border-teal-200",
  },
];

export default function Landing() {
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });

  return (
    <div className="min-h-svh bg-background">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="animate-fade-up overflow-hidden rounded-3xl bg-[#0F4C81] px-6 py-12 text-white sm:px-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="border-[#BFDBFE] bg-[#1E3A8A] text-[#E0E7FF]">Kurikulum Merdeka</Badge>
              <Badge className="border-[#BFDBFE] bg-[#1E3A8A] text-[#E0E7FF]">Kurikulum 2013</Badge>
              <Badge className="border-[#BFDBFE] bg-[#1E3A8A] text-[#E0E7FF]">PAUD — SMK</Badge>
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Rancang Perangkat Pembelajaran dalam Hitungan Menit
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[#E0F2FE] sm:text-lg">
              Dari Modul Ajar hingga KKTP — pilih kurikulum, pendekatan, model, metode, dan strategi
              pembelajaran yang digunakan di Indonesia. Sistem merangkai draf dokumen siap cetak
              mengikuti sintaks model yang Anda pilih.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {me.data ? (
                <>
                  <Link to="/designer" data-testid="hero-start-designing-btn">
                    <Button size="lg" className="bg-white text-[#0F4C81] hover:bg-[#E0F2FE]">
                      Mulai Mendesain <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-[#E0F2FE] bg-transparent text-white hover:bg-[#1E3A8A] hover:text-white"
                    >
                      Ke Dasbor
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" data-testid="hero-register-btn">
                    <Button size="lg" className="bg-white text-[#0F4C81] hover:bg-[#E0F2FE]">
                      Gratis — Daftar Guru <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-[#E0F2FE] bg-transparent text-white hover:bg-[#1E3A8A] hover:text-white"
                    >
                      Masuk
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Taxonomy stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: `${CURRICULA.length}`, label: "Pilihan Kurikulum" },
            { value: `${APPROACHES.length}`, label: "Pendekatan Pembelajaran" },
            { value: `${MODELS.length}`, label: "Model + Sintaks Lengkap" },
            { value: `${METHODS.length + STRATEGIES.length}`, label: "Metode & Strategi" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-primary"
            >
              <p className="font-heading text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Document types */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Satu sistem, lima perangkat lengkap
        </h2>
        <p className="mt-1 text-muted-foreground">
          Semua komponen utama kurikulum dirangkai otomatis mengikuti pilihan pedagogis Anda.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DOC_CARDS.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className={`rounded-2xl border p-5 transition-transform hover:-translate-y-0.5 ${accent}`}
            >
              <Icon className="h-7 w-7" />
              <h3 className="mt-3 font-heading text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow band */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Alur kerja yang memahami guru
              </h2>
              <ol className="mt-5 space-y-4">
                {[
                  "Isi identitas, kurikulum, jenjang, dan mata pelajaran",
                  "Pilih pendekatan, model, metode, dan strategi — lengkap dengan penjelasannya",
                  "Tentukan CP/TP dan dimensi Profil Lulusan",
                  "Klik 'Auto-susun Sintaks' — langkah pembelajaran terisi mengikuti model",
                  "Pratinjau, simpan, lalu cetak dokumen siap tanda tangan",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
              <Link to="/reference" className="mt-6 inline-block">
                <Button variant="outline" className="border-primary text-primary hover:bg-accent hover:text-accent-foreground">
                  <Sparkles className="mr-1 h-4 w-4" /> Jelajahi Ensiklopedia Pedagogi
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-2 text-primary">
                <Printer className="h-5 w-5" />
                <p className="font-heading font-bold">Siap cetak A4</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Setiap dokumen dirender dalam format A4 standar Kemendikbud: kop satuan pendidikan,
                tabel identitas, langkah pembelajaran per sintaks, blok asesmen, dan area tanda
                tangan Kepala Sekolah & Guru Mata Pelajaran.
              </p>
              <div className="mt-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  Modul Ajar — Matematika
                </p>
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-3/4 rounded bg-slate-200" />
                  <div className="h-2 w-full rounded bg-slate-200" />
                  <div className="h-2 w-5/6 rounded bg-slate-200" />
                  <div className="h-2 w-2/3 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <p className="text-center text-sm text-muted-foreground">
          PerancangRPP — membantu guru PAUD, SD, SMP, SMA, dan SMK merancang perangkat pembelajaran.
        </p>
      </footer>
    </div>
  );
}
