import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, CheckCircle2, ClipboardCheck, ClipboardPaste, FileText, Loader2, MessageSquareHeart, Pencil, Printer, Sparkles, Trash2, XCircle } from "lucide-react";
import { LkpdBulkInput } from "@/components/LkpdBulkInput";
import { LkpdRecap } from "@/components/LkpdRecap";
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from "@/lib/api";
import { QUESTION_TYPE_LABELS } from "@/lib/pedagogy";
import type { GradeIn, LessonDocument, LkpdSubmission, SubmissionUpdate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const GRADER_LABEL: Record<string, string> = { auto: "Otomatis", ai: "AI", guru: "Guru", perlu_guru: "Perlu dinilai guru" };

function optionsOf(question: string): string[] {
  return Array.from(question.matchAll(/^\s*([A-E])[.)]\s/gm)).map((m) => m[1]);
}

function errorText(error: unknown, fallback: string) {
  const body = error instanceof ApiError ? (error.body as { detail?: unknown } | null) : null;
  return body && typeof body.detail === "string" ? body.detail : fallback;
}

function SubmissionCard({ sub, onChanged }: { sub: LkpdSubmission; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [scores, setScores] = useState<Record<number, string>>({});

  const correct = useMutation({
    mutationFn: () =>
      apiPut<LkpdSubmission>(`/lkpd/submissions/${sub.id}`, {
        scores: Object.entries(scores).map(([order, score]) => ({ order: Number(order), score: Number(score) || 0 })),
      } satisfies SubmissionUpdate),
    onSuccess: () => { toast.success("Koreksi nilai tersimpan"); setEditing(false); setScores({}); onChanged(); },
    onError: (e) => toast.error(errorText(e, "Gagal menyimpan koreksi")),
  });
  const remove = useMutation({
    mutationFn: () => apiDelete<void>(`/lkpd/submissions/${sub.id}`),
    onSuccess: () => { toast.success("Hasil dihapus"); onChanged(); },
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4" data-testid="lkpd-submission-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading font-bold" data-testid="lkpd-submission-name">{sub.student_name} {sub.student_class && <span className="text-sm font-normal text-muted-foreground">· {sub.student_class}</span>}</p>
          <p className="text-xs text-muted-foreground">Skor {sub.total_score}/{sub.max_score} · KKM {sub.kkm}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl font-bold text-primary" data-testid="lkpd-submission-final-score">{sub.final_score}</p>
          <Badge className={sub.passed ? "bg-emerald-600 hover:bg-emerald-600" : "bg-rose-600 hover:bg-rose-600"} data-testid="lkpd-submission-status">
            {sub.passed ? "Tuntas" : "Belum Tuntas"}
          </Badge>
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm" data-testid="lkpd-submission-kktp">
        <span className="font-semibold">KKTP{sub.kktp_label ? ` (${sub.kktp_label})` : ""}:</span> {sub.kktp_description}
      </p>
      <div className="mt-3 space-y-2">
        {sub.answers.map((a) => (
          <div key={a.order} className="flex items-start gap-2 text-sm">
            {a.correct === true ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : a.correct === false ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /> : <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />}
            <div className="flex-1">
              <p><span className="font-semibold">No. {a.order}</span> — jawaban: <span className="italic">{a.answer || "(kosong)"}</span></p>
              <p className="text-xs text-muted-foreground">{a.feedback} · dinilai: {GRADER_LABEL[a.graded_by] ?? a.graded_by}</p>
            </div>
            {editing ? (
              <Input type="number" min={0} max={a.max_score} step="0.5" className="h-8 w-20" defaultValue={a.score} onChange={(e) => setScores((s) => ({ ...s, [a.order]: e.target.value }))} data-testid={`lkpd-correct-score-${a.order}-input`} />
            ) : (
              <span className={`shrink-0 font-semibold ${a.graded_by === "perlu_guru" ? "text-amber-600" : ""}`}>{a.score}/{a.max_score}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        {editing ? (
          <>
            <Button size="sm" disabled={correct.isPending} onClick={() => correct.mutate()} data-testid="lkpd-correct-save-btn">Simpan Koreksi</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setScores({}); }}>Batal</Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="lkpd-correct-btn"><Pencil className="mr-1 h-3.5 w-3.5" /> Koreksi Nilai</Button>
        )}
        <Link to={`/lkpd/${sub.document_id}/kartu?sid=${sub.id}`} data-testid="lkpd-submission-card-link">
          <Button size="sm" variant="outline"><MessageSquareHeart className="mr-1 h-3.5 w-3.5" /> Kartu</Button>
        </Link>
        <Button size="sm" variant="ghost" className="text-destructive hover:bg-rose-50 hover:text-destructive" disabled={remove.isPending} onClick={() => remove.mutate()} data-testid="lkpd-submission-delete-btn">
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
        </Button>
      </div>
    </div>
  );
}

export default function LkpdGrade() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const doc = useQuery({ queryKey: ["document", id], queryFn: () => apiGet<LessonDocument>(`/documents/${id}`) });
  const subs = useQuery({ queryKey: ["lkpd-submissions", id], queryFn: () => apiGet<LkpdSubmission[]>(`/lkpd/${id}/submissions`), enabled: doc.data?.doc_type === "lkpd" });
  const [name, setName] = useState("");
  const [klass, setKlass] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [view, setView] = useState<"single" | "bulk" | "recap">("single");

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["lkpd-submissions", id] });

  const grade = useMutation({
    mutationFn: () =>
      apiPost<LkpdSubmission>(`/lkpd/${id}/grade`, {
        student_name: name.trim(),
        student_class: klass.trim(),
        answers: Object.entries(answers).map(([order, answer]) => ({ order: Number(order), answer })),
      } satisfies GradeIn),
    onSuccess: (s) => {
      toast.success(`${s.student_name}: nilai ${s.final_score} — ${s.passed ? "Tuntas" : "Belum Tuntas"}`);
      setName(""); setAnswers({});
      refresh();
    },
    onError: (e) => toast.error(errorText(e, "Gagal menilai LKPD")),
  });

  if (doc.isPending) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!doc.data || doc.data.doc_type !== "lkpd") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="font-heading text-lg font-semibold">LKPD tidak ditemukan</p>
        <Link to="/dashboard" className="mt-4 inline-block"><Button variant="outline"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Dasbor</Button></Link>
      </div>
    );
  }

  const items = doc.data.assessment_items;
  const hasEssay = items.some((i) => !["pilihan_ganda", "isian", "menjodohkan"].includes(i.question_type));
  const list = subs.data ?? [];
  const avg = list.length ? (list.reduce((s, x) => s + x.final_score, 0) / list.length).toFixed(1) : "-";
  const passed = list.filter((s) => s.passed).length;
  const VIEWS = [
    { id: "single", label: "Nilai Per Siswa", icon: ClipboardCheck },
    { id: "bulk", label: "Input Massal (Excel)", icon: ClipboardPaste },
    { id: "recap", label: `Rekap Kelas (${list.length})`, icon: BarChart3 },
  ] as const;

  return (
    <div className="animate-fade-up space-y-6">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Penilaian LKPD otomatis · KKM {doc.data.kkm_score ?? 75}</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight" data-testid="lkpd-grade-title">{doc.data.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/document/${id}/print`}><Button variant="outline" data-testid="lkpd-print-btn"><Printer className="mr-1 h-4 w-4" /> Cetak LKPD</Button></Link>
          <a href={`/api/documents/${id}/export.docx`} download data-testid="lkpd-word-btn"><Button variant="outline"><FileText className="mr-1 h-4 w-4" /> Word</Button></a>
          <Link to="/dashboard"><Button variant="outline" data-testid="lkpd-back-btn"><ArrowLeft className="mr-1 h-4 w-4" /> Dasbor</Button></Link>
        </div>
      </div>

      <div className="no-print flex flex-wrap gap-2" role="tablist">
        {VIEWS.map(({ id: v, label, icon: Icon }) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} data-testid={`lkpd-view-${v}-tab`}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === v ? "bg-primary text-primary-foreground" : "border border-slate-200 bg-white text-slate-600 hover:bg-accent"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {view === "bulk" && <LkpdBulkInput docId={id!} items={items} onDone={() => { refresh(); setView("recap"); }} />}
      {view === "recap" && <LkpdRecap doc={doc.data} subs={list} />}

      {view === "single" && (
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <p className="flex items-center gap-2 font-heading text-lg font-bold"><ClipboardCheck className="h-5 w-5 text-primary" /> Masukkan Jawaban Siswa</p>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">LKPD ini belum memiliki soal. Tambahkan soal di Designer langkah 5.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="sname">Nama Siswa *</Label><Input id="sname" value={name} onChange={(e) => setName(e.target.value)} data-testid="lkpd-student-name-input" /></div>
                <div className="space-y-1.5"><Label htmlFor="sclass">Kelas</Label><Input id="sclass" value={klass} onChange={(e) => setKlass(e.target.value)} placeholder="3A" data-testid="lkpd-student-class-input" /></div>
              </div>
              {items.map((item) => {
                const opts = item.question_type === "pilihan_ganda" ? optionsOf(item.question) : [];
                return (
                  <div key={item.order} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">No. {item.order} · {QUESTION_TYPE_LABELS[item.question_type] ?? item.question_type}</Badge>
                      <span className="text-xs text-muted-foreground">skor {item.points}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm">{item.question}</p>
                    {item.question_type === "pilihan_ganda" ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(opts.length ? opts : ["A", "B", "C", "D"]).map((o) => (
                          <button key={o} type="button" onClick={() => setAnswers((a) => ({ ...a, [item.order]: o }))} data-testid={`lkpd-answer-${item.order}-option-${o}`}
                            className={`h-9 w-10 rounded-md border text-sm font-semibold transition-colors ${answers[item.order] === o ? "border-primary bg-primary text-primary-foreground" : "border-slate-300 hover:border-primary"}`}>
                            {o}
                          </button>
                        ))}
                      </div>
                    ) : item.question_type === "isian" || item.question_type === "menjodohkan" ? (
                      <Input className="mt-2" value={answers[item.order] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [item.order]: e.target.value }))} placeholder="Jawaban siswa" data-testid={`lkpd-answer-${item.order}-input`} />
                    ) : (
                      <Textarea className="mt-2" rows={3} value={answers[item.order] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [item.order]: e.target.value }))} placeholder="Salin jawaban uraian siswa" data-testid={`lkpd-answer-${item.order}-input`} />
                    )}
                  </div>
                );
              })}
              <Button className="w-full" size="lg" disabled={grade.isPending || !name.trim()} onClick={() => grade.mutate()} data-testid="lkpd-grade-submit-btn">
                {grade.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> {hasEssay ? "Memeriksa (uraian dinilai AI)…" : "Memeriksa…"}</> : <><ClipboardCheck className="mr-1 h-4 w-4" /> Periksa & Nilai Otomatis</>}
              </Button>
              {hasEssay && <p className="text-xs text-muted-foreground">PG & isian dicocokkan dengan kunci. Uraian dinilai AI memakai rubrik dan kunci — guru bisa mengoreksi setiap skor.</p>}
            </>
          )}
        </div>

        <div className="space-y-3 lg:col-span-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs text-muted-foreground">Dinilai</p><p className="font-heading text-xl font-bold" data-testid="lkpd-stat-count">{list.length}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs text-muted-foreground">Rata-rata</p><p className="font-heading text-xl font-bold" data-testid="lkpd-stat-avg">{avg}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs text-muted-foreground">Tuntas</p><p className="font-heading text-xl font-bold" data-testid="lkpd-stat-passed">{passed}/{list.length}</p></div>
          </div>
          {list.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-muted-foreground">Belum ada siswa yang dinilai.</p>}
          {list.map((s) => <SubmissionCard key={s.id + s.updated_at} sub={s} onChanged={refresh} />)}
        </div>
      </div>
      )}
    </div>
  );
}
