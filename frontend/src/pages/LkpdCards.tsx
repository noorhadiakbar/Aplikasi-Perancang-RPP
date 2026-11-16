import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Copy, Loader2, MessageCircle, Printer, Sparkles, XCircle } from "lucide-react";
import { apiGet } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import type { LessonDocument, LkpdSubmission, User } from "@/lib/types";
import { Button } from "@/components/ui/button";

// Plain-text version of a card — for clipboard / WhatsApp sharing with parents or students.
export function cardText(doc: LessonDocument, s: LkpdSubmission, teacher: string): string {
  const strengths = s.answers.filter((a) => a.score >= a.max_score && a.max_score > 0).map((a) => a.order);
  const lines = [
    `?? Kartu Umpan Balik — ${doc.title}`,
    `Nama: ${s.student_name}${s.student_class ? ` (Kelas ${s.student_class})` : ""}`,
    `Nilai: ${s.final_score} — ${s.passed ? "Tuntas ?" : "Belum Tuntas (perlu remedial)"}`,
    `KKTP: ${s.kktp_description}`,
    strengths.length ? `Sudah dikuasai: soal no ${strengths.join(", ")}` : "",
    "Catatan per soal:",
    ...s.answers.map((a) => `• No ${a.order} (${a.score}/${a.max_score}): ${a.feedback}`),
    `— ${teacher}`,
  ];
  return lines.filter(Boolean).join("\n");
}

function FeedbackCard({ doc, sub, profile }: { doc: LessonDocument; sub: LkpdSubmission; profile: User | null }) {
  const teacher = doc.teacher_name || profile?.name || "Guru";
  const text = cardText(doc, sub, teacher);
  const strengths = sub.answers.filter((a) => a.score >= a.max_score && a.max_score > 0);
  const improve = sub.answers.filter((a) => a.score < a.max_score);

  return (
    <article className="feedback-card break-inside-avoid rounded-2xl border-2 border-slate-200 bg-white p-5 print:rounded-none print:border-slate-400" data-testid="feedback-card">
      <header className="flex items-center gap-3 border-b border-slate-200 pb-3">
        {profile?.logo ? <img src={profile.logo} alt="" className="h-10 w-10 object-contain" /> : null}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{doc.school_name || profile?.school}</p>
          <p className="font-heading text-sm font-bold">Kartu Umpan Balik · {doc.title}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-primary" data-testid="feedback-card-score">{sub.final_score}</p>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${sub.passed ? "bg-emerald-600" : "bg-rose-600"}`} data-testid="feedback-card-status">
            {sub.passed ? "Tuntas" : "Perlu Remedial"}
          </span>
        </div>
      </header>
      <p className="mt-3 font-heading text-lg font-bold" data-testid="feedback-card-name">{sub.student_name} {sub.student_class && <span className="text-sm font-normal text-muted-foreground">· Kelas {sub.student_class}</span>}</p>
      <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm"><b>Capaian KKTP{sub.kktp_label ? ` (${sub.kktp_label})` : ""}:</b> {sub.kktp_description}</p>

      {strengths.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Sudah dikuasai</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {strengths.map((a) => <li key={a.order}>No {a.order}: {a.feedback}</li>)}
          </ul>
        </div>
      )}
      {improve.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1 text-sm font-semibold text-rose-700"><XCircle className="h-4 w-4" /> Yang perlu ditingkatkan</p>
          <ul className="mt-1 space-y-1 text-sm">
            {improve.map((a) => (
              <li key={a.order} className="flex gap-1.5">
                {a.graded_by === "ai" ? <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" /> : <span className="w-3.5" />}
                <span>No {a.order} ({a.score}/{a.max_score}): {a.feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <footer className="mt-4 flex items-end justify-between border-t border-dashed border-slate-300 pt-3 text-xs text-muted-foreground">
        <span>Paraf orang tua: ..............</span>
        <span>Guru: <b className="text-foreground">{teacher}</b></span>
      </footer>
      <div className="no-print mt-3 flex gap-2">
        <Button size="sm" variant="outline" data-testid="feedback-card-copy-btn"
          onClick={() => void navigator.clipboard.writeText(text).then(() => toast.success("Teks kartu disalin"), () => toast.error("Gagal menyalin"))}>
          <Copy className="mr-1 h-3.5 w-3.5" /> Salin Teks
        </Button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" data-testid="feedback-card-whatsapp-btn">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><MessageCircle className="mr-1 h-3.5 w-3.5" /> Bagikan WhatsApp</Button>
        </a>
      </div>
    </article>
  );
}

export default function LkpdCards() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const sid = params.get("sid");
  const kelas = params.get("kelas");
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });
  const doc = useQuery({ queryKey: ["document", id], queryFn: () => apiGet<LessonDocument>(`/documents/${id}`) });
  const subs = useQuery({ queryKey: ["lkpd-submissions", id], queryFn: () => apiGet<LkpdSubmission[]>(`/lkpd/${id}/submissions`), enabled: doc.data?.doc_type === "lkpd" });

  if (doc.isPending || subs.isPending) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!doc.data) return <p className="py-20 text-center text-muted-foreground">LKPD tidak ditemukan.</p>;

  const list = (subs.data ?? [])
    .filter((s) => (sid ? s.id === sid : true))
    .filter((s) => (kelas ? s.student_class === kelas : true))
    .sort((a, b) => a.student_name.localeCompare(b.student_name));

  return (
    <div className="animate-fade-up space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kartu catatan per siswa · {list.length} kartu</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Kartu Umpan Balik Siswa</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} disabled={!list.length} data-testid="feedback-cards-print-btn"><Printer className="mr-1 h-4 w-4" /> Cetak {sid ? "Kartu" : "Semua Kartu"}</Button>
          <Link to={`/lkpd/${id}/nilai`}><Button variant="outline" data-testid="feedback-cards-back-btn"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Button></Link>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-muted-foreground" data-testid="feedback-cards-empty">Belum ada nilai siswa.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-3">
          {list.map((s) => <FeedbackCard key={s.id} doc={doc.data} sub={s} profile={me.data ?? null} />)}
        </div>
      )}
    </div>
  );
}
