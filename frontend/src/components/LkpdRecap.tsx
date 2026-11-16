import { useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, FileSpreadsheet, FileText, MessageSquareHeart, Printer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonDocument, LkpdSubmission } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PALETTE = ["#BE123C", "#D97706", "#0D9488", "#0F4C81", "#15803D", "#7C3AED"];

export function LkpdRecap({ doc, subs }: { doc: LessonDocument; subs: LkpdSubmission[] }) {
  const classes = Array.from(new Set(subs.map((s) => s.student_class).filter(Boolean))).sort();
  const [klass, setKlass] = useState("all");
  const list = (klass === "all" ? subs : subs.filter((s) => s.student_class === klass)).slice().sort((a, b) => b.final_score - a.final_score);
  const qs = klass === "all" ? "" : `?student_class=${encodeURIComponent(klass)}`;
  const cardsQs = klass === "all" ? "" : `?kelas=${encodeURIComponent(klass)}`;

  if (subs.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-muted-foreground" data-testid="lkpd-recap-empty">Belum ada nilai siswa untuk direkap.</p>;
  }

  const passed = list.filter((s) => s.passed);
  const remedial = list.filter((s) => !s.passed);
  const avg = list.length ? list.reduce((s, x) => s + x.final_score, 0) / list.length : 0;
  const pie = [
    { name: "Tuntas", value: passed.length, color: "#15803D" },
    { name: "Belum Tuntas", value: remedial.length, color: "#BE123C" },
  ];
  const intervals = doc.kktp_intervals.length
    ? doc.kktp_intervals.map((iv) => ({ name: iv.range_label, jumlah: list.filter((s) => s.kktp_label === iv.range_label).length }))
    : [{ name: `< ${doc.kkm_score ?? 75}`, jumlah: remedial.length }, { name: `≥ ${doc.kkm_score ?? 75}`, jumlah: passed.length }];
  const itemStats = doc.assessment_items.map((item) => {
    const answers = list.map((s) => s.answers.find((a) => a.order === item.order)).filter(Boolean);
    const pct = answers.length ? (answers.reduce((s, a) => s + (a!.max_score ? a!.score / a!.max_score : 0), 0) / answers.length) * 100 : 0;
    return { name: `No ${item.order}`, capaian: Math.round(pct) };
  });

  return (
    <div className="space-y-5" data-testid="lkpd-recap">
      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">{doc.school_name}</p>
        <p className="font-semibold">Rekap Nilai — {doc.title}</p>
        <p className="text-sm">{doc.subject} · {klass === "all" ? "Semua kelas" : `Kelas ${klass}`} · KKM {doc.kkm_score ?? 75}</p>
      </div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <p className="font-heading text-lg font-bold">Rekap Nilai Kelas</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()} data-testid="lkpd-recap-print-btn"><Printer className="mr-1 h-4 w-4" /> Cetak Rekap</Button>
          <a href={`/api/lkpd/${doc.id}/recap.xlsx${qs}`} download data-testid="lkpd-recap-excel-btn"><Button size="sm" variant="outline"><FileSpreadsheet className="mr-1 h-4 w-4" /> Excel</Button></a>
          <a href={`/api/lkpd/${doc.id}/recap.docx${qs}`} download data-testid="lkpd-recap-word-btn"><Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" /> Word</Button></a>
          <Link to={`/lkpd/${doc.id}/kartu${cardsQs}`} data-testid="lkpd-recap-cards-btn"><Button size="sm"><MessageSquareHeart className="mr-1 h-4 w-4" /> Kartu Umpan Balik</Button></Link>
        <Select value={klass} onValueChange={(v: string) => setKlass(v)}>
          <SelectTrigger className="w-44 bg-white" data-testid="lkpd-recap-class-select"><SelectValue>{klass === "all" ? "Semua kelas" : `Kelas ${klass}`}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kelas</SelectItem>
            {classes.map((c) => <SelectItem key={c} value={c}>Kelas {c}</SelectItem>)}
          </SelectContent>
        </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Jumlah siswa", list.length, "lkpd-recap-count"],
          ["Rata-rata", avg.toFixed(1), "lkpd-recap-avg"],
          ["Ketuntasan", `${list.length ? Math.round((passed.length / list.length) * 100) : 0}%`, "lkpd-recap-pass-rate"],
          ["Perlu remedial", remedial.length, "lkpd-recap-remedial-count"],
        ].map(([label, value, testid]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-heading text-2xl font-bold text-primary" data-testid={testid as string}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4" data-testid="lkpd-recap-pass-chart">
          <p className="mb-2 text-sm font-semibold">Grafik Ketuntasan (KKM {doc.kkm_score ?? 75})</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2} isAnimationActive={false} label={({ name, value }) => `${name}: ${value}`}>
                {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4" data-testid="lkpd-recap-interval-chart">
          <p className="mb-2 text-sm font-semibold">Sebaran Interval KKTP</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={intervals}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Siswa" radius={[4, 4, 0, 0]}>
                {intervals.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4" data-testid="lkpd-recap-item-chart">
          <p className="mb-2 text-sm font-semibold">Capaian per Butir Soal (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={itemStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Bar dataKey="capaian" name="Capaian %" fill="#0F4C81" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4" data-testid="lkpd-recap-remedial-list">
        <p className="flex items-center gap-2 font-heading font-bold text-rose-900"><AlertTriangle className="h-4 w-4" /> Daftar Siswa Remedial ({remedial.length})</p>
        {remedial.length === 0 ? (
          <p className="mt-2 text-sm text-rose-900/80">Semua siswa sudah tuntas. 🎉</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-rose-900/80">
                <tr><th className="py-1 pr-3">Nama</th><th className="py-1 pr-3">Kelas</th><th className="py-1 pr-3">Nilai</th><th className="py-1 pr-3">Butir belum tuntas</th><th className="py-1">Tindak lanjut (KKTP)</th></tr>
              </thead>
              <tbody>
                {remedial.map((s) => (
                  <tr key={s.id} className="border-t border-rose-200" data-testid="lkpd-recap-remedial-row">
                    <td className="py-1.5 pr-3 font-semibold">{s.student_name}</td>
                    <td className="py-1.5 pr-3">{s.student_class || "-"}</td>
                    <td className="py-1.5 pr-3 font-bold text-rose-700">{s.final_score}</td>
                    <td className="py-1.5 pr-3">{s.answers.filter((a) => a.score < a.max_score).map((a) => a.order).join(", ") || "-"}</td>
                    <td className="py-1.5 text-xs">{s.kktp_description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 font-heading font-bold"><Trophy className="h-4 w-4 text-amber-500" /> Rekap Seluruh Siswa</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm" data-testid="lkpd-recap-table">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="py-1 pr-3">Peringkat</th><th className="py-1 pr-3">Nama</th><th className="py-1 pr-3">Kelas</th><th className="py-1 pr-3">Skor</th><th className="py-1 pr-3">Nilai</th><th className="py-1 pr-3">Status</th><th className="py-1">Interval KKTP</th></tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} className="border-t border-slate-100" data-testid="lkpd-recap-row">
                  <td className="py-1.5 pr-3">{i + 1}</td>
                  <td className="py-1.5 pr-3 font-semibold">{s.student_name}</td>
                  <td className="py-1.5 pr-3">{s.student_class || "-"}</td>
                  <td className="py-1.5 pr-3">{s.total_score}/{s.max_score}</td>
                  <td className="py-1.5 pr-3 font-bold">{s.final_score}</td>
                  <td className="py-1.5 pr-3"><Badge className={s.passed ? "bg-emerald-600 hover:bg-emerald-600" : "bg-rose-600 hover:bg-rose-600"}>{s.passed ? "Tuntas" : "Remedial"}</Badge></td>
                  <td className="py-1.5 text-xs">{s.kktp_label || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
