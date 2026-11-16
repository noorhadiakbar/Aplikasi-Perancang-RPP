import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardPaste, Download, Loader2, Users } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import type { AssessmentItem, BulkGradeIn, GradeIn, LkpdSubmission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Parses rows copied from Excel/Sheets (tab-separated; ; or , also accepted):
// Nama | Kelas | Jawaban No 1 | No 2 |   a header row starting with "Nama" is skipped.
export function parsePasted(text: string, items: AssessmentItem[]): GradeIn[] {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim());
  const sep = lines.some((l) => l.includes("\t")) ? "\t" : lines.some((l) => l.includes(";")) ? ";" : ",";
  return lines
    .map((line) => line.split(sep).map((c) => c.trim()))
    .filter((cells, i) => !(i === 0 && /^nama/i.test(cells[0] ?? "")))
    .filter((cells) => cells[0] && !/^contoh siswa$/i.test(cells[0]))
    .map((cells) => ({
      student_name: cells[0],
      student_class: cells[1] ?? "",
      answers: items.map((item, idx) => ({ order: item.order, answer: cells[idx + 2] ?? "" })),
    }));
}

export function LkpdBulkInput({ docId, items, onDone }: { docId: string; items: AssessmentItem[]; onDone: () => void }) {
  const [text, setText] = useState("");
  const students = useMemo(() => parsePasted(text, items), [text, items]);
  const hasEssay = items.some((i) => !["pilihan_ganda", "isian", "menjodohkan"].includes(i.question_type));

  const grade = useMutation({
    mutationFn: () => apiPost<LkpdSubmission[]>(`/lkpd/${docId}/grade-bulk`, { students } satisfies BulkGradeIn),
    onSuccess: (subs) => {
      const passed = subs.filter((s) => s.passed).length;
      toast.success(`${subs.length} siswa dinilai  ${passed} tuntas, ${subs.length - passed} perlu remedial`);
      setText("");
      onDone();
    },
    onError: (e) => {
      const body = e instanceof ApiError ? (e.body as { detail?: unknown } | null) : null;
      toast.error(body && typeof body.detail === "string" ? body.detail : "Gagal menilai massal (maks. 60 siswa sekali kirim)");
    },
  });

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-heading text-lg font-bold"><ClipboardPaste className="h-5 w-5 text-primary" /> Input Nilai Massal dari Excel</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Salin baris dari Excel lalu tempel di bawah. Urutan kolom: <b>Nama  Kelas  Jawaban No 1  No {items.length}</b>. Untuk PG cukup huruf (AE).
          </p>
        </div>
        <a href={`/api/lkpd/${docId}/template.xlsx`} download data-testid="lkpd-bulk-template-btn">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Unduh Template Excel</Button>
        </a>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bulk">Tempel data jawaban siswa</Label>
        <Textarea id="bulk" rows={7} className="font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"Nama\tKelas\tNo 1\tNo 2\nAni\t3A\tB\t4\nBudi\t3A\tA\t3"} data-testid="lkpd-bulk-textarea" />
      </div>

      {students.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs" data-testid="lkpd-bulk-preview">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-2 py-1.5">#</th><th className="px-2 py-1.5">Nama</th><th className="px-2 py-1.5">Kelas</th>
                {items.map((i) => <th key={i.order} className="px-2 py-1.5">No {i.order}</th>)}
              </tr>
            </thead>
            <tbody>
              {students.map((s, r) => (
                <tr key={r} className="border-t border-slate-100" data-testid="lkpd-bulk-preview-row">
                  <td className="px-2 py-1">{r + 1}</td><td className="px-2 py-1 font-semibold">{s.student_name}</td><td className="px-2 py-1">{s.student_class}</td>
                  {s.answers.map((a) => <td key={a.order} className={`max-w-40 truncate px-2 py-1 ${a.answer ? "" : "text-rose-500"}`}>{a.answer || "kosong"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button className="w-full" size="lg" disabled={!students.length || grade.isPending || students.length > 60} onClick={() => grade.mutate()} data-testid="lkpd-bulk-grade-btn">
        {grade.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Menilai {students.length} siswa{hasEssay ? " (uraian oleh AI, bisa 12 menit)" : ""}</> : <><Users className="mr-1 h-4 w-4" /> Nilai Semua ({students.length} siswa)</>}
      </Button>
      {students.length > 60 && <p className="text-xs text-rose-600">Maksimal 60 siswa per pengiriman  bagi menjadi beberapa kali.</p>}
    </div>
  );
}
