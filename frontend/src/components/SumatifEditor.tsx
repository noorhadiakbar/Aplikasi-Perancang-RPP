import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import { COGNITIVE_LEVELS, DOC_TYPE_LABELS, QUESTION_TYPE_LABELS } from "@/lib/pedagogy";
import type {
  AssessmentItem,
  GenerateAssessmentIn,
  GenerateAssessmentOut,
  LessonDocument,
  RubricRow,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const ASSESSMENT_SCOPES = ["Akhir Semester", "Akhir Jenjang", "Lingkup Materi"];

const EMPTY_ITEM: Omit<AssessmentItem, "order"> = {
  objective: "",
  indicator: "",
  cognitive_level: "C2",
  content: "",
  question_type: "pilihan_ganda",
  question: "",
  answer: "",
  points: 0,
};

const EMPTY_RUBRIC: RubricRow = {
  criterion: "",
  excellent: "",
  good: "",
  adequate: "",
  needs_guidance: "",
};

// Builds the "isi modul" text the AI reads so questions follow the actual material taught.
export function moduleContentOf(doc: LessonDocument): string {
  return [
    doc.meaningful_understanding && `Pemahaman bermakna: ${doc.meaningful_understanding}`,
    doc.trigger_questions && `Pertanyaan pemantik: ${doc.trigger_questions}`,
    ...doc.core_activities.map((s) => `${s.phase}: ${s.description}`),
    ...doc.atp_entries.map((e) => `TP ${e.order}: ${e.objective} — ${e.content}`),
    doc.media && `Media: ${doc.media}`,
    doc.sources && `Sumber: ${doc.sources}`,
  ]
    .filter(Boolean)
    .join("\n");
}

interface Props {
  variant?: "sumatif" | "lkpd";
  context: Omit<GenerateAssessmentIn, "num_multiple_choice" | "num_essay" | "assessment_scope">;
  scope: string;
  onScopeChange: (v: string) => void;
  examDuration: string;
  onExamDurationChange: (v: string) => void;
  sourceId: string | null;
  sourceOptions: LessonDocument[];
  onImportSource: (doc: LessonDocument) => void;
  items: AssessmentItem[];
  onItemsChange: (items: AssessmentItem[]) => void;
  rubric: RubricRow[];
  onRubricChange: (rows: RubricRow[]) => void;
}

export function SumatifEditor(props: Props) {
  const { items, onItemsChange, rubric, onRubricChange } = props;
  const [numMc, setNumMc] = useState("8");
  const [numEssay, setNumEssay] = useState("2");

  const renumber = (rows: AssessmentItem[]) => rows.map((r, i) => ({ ...r, order: i + 1 }));
  const patchItem = (i: number, patch: Partial<AssessmentItem>) =>
    onItemsChange(items.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const patchRubric = (i: number, patch: Partial<RubricRow>) =>
    onRubricChange(rubric.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const generate = useMutation({
    mutationFn: () =>
      apiPost<GenerateAssessmentOut>("/assessments/generate", {
        ...props.context,
        assessment_scope: props.scope,
        num_multiple_choice: Number(numMc) || 0,
        num_essay: Number(numEssay) || 0,
      } satisfies GenerateAssessmentIn),
    onSuccess: (out) => {
      onItemsChange(renumber(out.items));
      onRubricChange(out.rubric);
      toast.success(`${out.items.length} butir soal + rubrik berhasil disusun AI`);
    },
    onError: (error) => {
      const body = error instanceof ApiError ? (error.body as { detail?: unknown } | null) : null;
      toast.error(body && typeof body.detail === "string" ? body.detail : "Gagal menyusun soal");
    },
  });

  const totalPoints = items.reduce((sum, r) => sum + (Number(r.points) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Source + scope */}
      <div className="space-y-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
        <div className="space-y-1.5">
          <Label>Rujukan Modul / RPP / ATP</Label>
          <Select
            value={props.sourceId ?? ""}
            onValueChange={(v: string) => {
              const doc = props.sourceOptions.find((d) => d.id === v);
              if (doc) props.onImportSource(doc);
            }}
          >
            <SelectTrigger data-testid="sumatif-source-select" className="w-full bg-white">
              <SelectValue>
                {props.sourceOptions.find((d) => d.id === props.sourceId)?.title ??
                  "Pilih dokumen untuk mengambil CP, TP & materi"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {props.sourceOptions.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  [{DOC_TYPE_LABELS[doc.doc_type]}] {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-[#1E3A8A]">
            Identitas, CP, dan TP disalin otomatis; isi kegiatan modul dipakai AI agar soal sesuai materi.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {props.variant !== "lkpd" && (
          <div className="space-y-1.5">
            <Label>Jenis Asesmen Sumatif</Label>
            <Select value={props.scope} onValueChange={(v: string) => props.onScopeChange(v)}>
              <SelectTrigger data-testid="sumatif-scope-select" className="w-full bg-white">
                <SelectValue>Sumatif {props.scope}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ASSESSMENT_SCOPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    Sumatif {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="duration">Waktu Pengerjaan</Label>
            <Input
              id="duration"
              className="bg-white"
              value={props.examDuration}
              onChange={(e) => props.onExamDurationChange(e.target.value)}
              placeholder="90 menit"
              data-testid="sumatif-duration-input"
            />
          </div>
        </div>
      </div>

      {/* AI generation */}
      <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="flex items-center gap-1.5 font-heading text-sm font-bold text-teal-900">
          <Sparkles className="h-4 w-4" /> Susun Kisi-Kisi, Soal & Rubrik dengan AI
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="num-mc">Pilihan Ganda</Label>
            <Input id="num-mc" type="number" min={0} max={40} className="bg-white" value={numMc} onChange={(e) => setNumMc(e.target.value)} data-testid="sumatif-num-mc-input" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="num-essay">Uraian</Label>
            <Input id="num-essay" type="number" min={0} max={15} className="bg-white" value={numEssay} onChange={(e) => setNumEssay(e.target.value)} data-testid="sumatif-num-essay-input" />
          </div>
        </div>
        <Button
          className="w-full bg-teal-700 hover:bg-teal-800"
          disabled={generate.isPending}
          onClick={() => generate.mutate()}
          data-testid="sumatif-generate-ai-btn"
        >
          {generate.isPending ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" /> AI sedang menyusun soal (± 1 menit)…
            </>
          ) : (
            <>
              <Sparkles className="mr-1 h-4 w-4" /> {items.length ? "Susun Ulang dengan AI" : "Susun dengan AI"}
            </>
          )}
        </Button>
        <p className="text-xs text-teal-900/80">
          Hasil AI adalah draf — periksa dan sesuaikan setiap butir sebelum digunakan. Menyusun ulang akan mengganti butir yang ada.
        </p>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Butir Kisi-Kisi & Soal ({items.length})</Label>
          <Badge variant={totalPoints === 100 ? "secondary" : "outline"} data-testid="sumatif-total-points">
            Total skor: {totalPoints}
          </Badge>
        </div>
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-muted-foreground">
            Belum ada butir soal. Susun dengan AI atau tambah manual.
          </p>
        )}
        {items.map((row, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3" data-testid="sumatif-item">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">No. {i + 1}</Badge>
              <Select value={row.question_type} onValueChange={(v: string) => patchItem(i, { question_type: v })}>
                <SelectTrigger className="h-8 flex-1" data-testid={`sumatif-item-${i + 1}-type-select`}>
                  <SelectValue>{QUESTION_TYPE_LABELS[row.question_type] ?? row.question_type}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUESTION_TYPE_LABELS).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={row.cognitive_level} onValueChange={(v: string) => patchItem(i, { cognitive_level: v })}>
                <SelectTrigger className="h-8 w-24" data-testid={`sumatif-item-${i + 1}-level-select`}>
                  <SelectValue>{row.cognitive_level}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COGNITIVE_LEVELS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                className="h-8 w-20"
                value={String(row.points)}
                onChange={(e) => patchItem(i, { points: Number(e.target.value) || 0 })}
                aria-label="Skor"
                data-testid={`sumatif-item-${i + 1}-points-input`}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-rose-50 hover:text-destructive"
                onClick={() => onItemsChange(renumber(items.filter((_, j) => j !== i)))}
                data-testid={`sumatif-item-${i + 1}-remove-btn`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input value={row.objective} onChange={(e) => patchItem(i, { objective: e.target.value })} placeholder="Tujuan pembelajaran yang diukur" data-testid={`sumatif-item-${i + 1}-objective-input`} />
            <Input value={row.content} onChange={(e) => patchItem(i, { content: e.target.value })} placeholder="Materi pokok" data-testid={`sumatif-item-${i + 1}-content-input`} />
            <Textarea rows={2} value={row.indicator} onChange={(e) => patchItem(i, { indicator: e.target.value })} placeholder="Indikator soal: Disajikan …, peserta didik dapat …" data-testid={`sumatif-item-${i + 1}-indicator-input`} />
            <Textarea rows={3} value={row.question} onChange={(e) => patchItem(i, { question: e.target.value })} placeholder="Teks soal (untuk PG, tulis opsi A–D tiap baris)" data-testid={`sumatif-item-${i + 1}-question-input`} />
            <Textarea rows={2} value={row.answer} onChange={(e) => patchItem(i, { answer: e.target.value })} placeholder="Kunci jawaban / jawaban ideal & pedoman skor" data-testid={`sumatif-item-${i + 1}-answer-input`} />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onItemsChange(renumber([...items, { ...EMPTY_ITEM, order: 0 }]))}
          data-testid="sumatif-add-item-btn"
        >
          <Plus className="mr-1 h-4 w-4" /> Tambah Butir Manual
        </Button>
      </div>

      {/* Rubric */}
      <div className="space-y-2">
        <Label>Rubrik Penilaian (4 level)</Label>
        {rubric.map((row, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3" data-testid="sumatif-rubric-row">
            <div className="flex items-center gap-2">
              <Input value={row.criterion} onChange={(e) => patchRubric(i, { criterion: e.target.value })} placeholder="Kriteria / aspek yang dinilai" data-testid={`sumatif-rubric-${i + 1}-criterion-input`} />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-rose-50 hover:text-destructive"
                onClick={() => onRubricChange(rubric.filter((_, j) => j !== i))}
                data-testid={`sumatif-rubric-${i + 1}-remove-btn`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={row.excellent} onChange={(e) => patchRubric(i, { excellent: e.target.value })} placeholder="Sangat Baik (4)" data-testid={`sumatif-rubric-${i + 1}-excellent-input`} />
              <Input value={row.good} onChange={(e) => patchRubric(i, { good: e.target.value })} placeholder="Baik (3)" data-testid={`sumatif-rubric-${i + 1}-good-input`} />
              <Input value={row.adequate} onChange={(e) => patchRubric(i, { adequate: e.target.value })} placeholder="Cukup (2)" data-testid={`sumatif-rubric-${i + 1}-adequate-input`} />
              <Input value={row.needs_guidance} onChange={(e) => patchRubric(i, { needs_guidance: e.target.value })} placeholder="Perlu Bimbingan (1)" data-testid={`sumatif-rubric-${i + 1}-needs-input`} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onRubricChange([...rubric, { ...EMPTY_RUBRIC }])} data-testid="sumatif-add-rubric-btn">
          <Plus className="mr-1 h-4 w-4" /> Tambah Kriteria Rubrik
        </Button>
      </div>
    </div>
  );
}
