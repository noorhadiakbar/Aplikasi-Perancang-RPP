import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import {
  APPROACHES,
  CURRICULA,
  DOC_TYPE_LABELS,
  GRADUATE_DIMENSIONS,
  LEVELS,
  METHODS,
  MODELS,
  PANCA_CINTA,
  STRATEGIES,
  SUBJECTS_BY_LEVEL,
  findApproach,
  findCurriculum,
  findLevel,
  findMethod,
  findModel,
  findStrategy,
} from "@/lib/pedagogy";
import type { AssessmentItem, LessonDocument, RubricRow, User } from "@/lib/types";
import { fetchMe } from "@/lib/auth";
import { DocumentSheet } from "@/components/DocumentSheet";
import { SumatifEditor, moduleContentOf } from "@/components/SumatifEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const STEPS = [
  "Identitas & Kurikulum",
  "Pilihan Pedagogis",
  "Capaian & Tujuan",
  "Langkah Pembelajaran",
  "Asesmen & Media",
  "Pratinjau & Cetak",
];

interface CoreRow {
  phase: string;
  description: string;
  duration_min: string;
}

interface AtpRow {
  order: string;
  objective: string;
  content: string;
}

interface KktpRow {
  range_label: string;
  description: string;
}

interface DesignerFormState {
  doc_type: string;
  title: string;
  curriculum: string;
  level: string;
  grade: string;
  phase: string;
  subject: string;
  time_allocation: string;
  academic_year: string;
  teacher_name: string;
  teacher_nip: string;
  school_name: string;
  approach: string;
  model: string;
  method: string;
  strategy: string;
  cp: string;
  objectives: string; // one TP per line
  dimensions: string[];
  panca_cinta: string[];
  source_document_id: string | null;
  assessment_scope: string;
  exam_duration: string;
  assessment_items: AssessmentItem[];
  scoring_rubric: RubricRow[];
  meaningful_understanding: string;
  trigger_questions: string;
  intro_activities: string;
  core_activities: CoreRow[];
  closing_activities: string;
  diagnostic_assessment: string;
  formative_assessment: string;
  summative_assessment: string;
  media: string;
  sources: string;
  remedial: string;
  enrichment: string;
  kkm_score: string;
  kktp_intervals: KktpRow[];
  atp_entries: AtpRow[];
  status: string;
}

const EMPTY_FORM: DesignerFormState = {
  doc_type: "modul_ajar",
  title: "",
  curriculum: "merdeka",
  level: "SD",
  grade: "1",
  phase: "A",
  subject: "",
  time_allocation: "2 x 35 menit",
  academic_year: "2025/2026",
  teacher_name: "",
  teacher_nip: "",
  school_name: "",
  approach: "saintifik",
  model: "pbl",
  method: "diskusi",
  strategy: "active_learning",
  cp: "",
  objectives: "",
  dimensions: [],
  panca_cinta: [],
  source_document_id: null,
  assessment_scope: "Akhir Semester",
  exam_duration: "90 menit",
  assessment_items: [],
  scoring_rubric: [],
  meaningful_understanding: "",
  trigger_questions: "",
  intro_activities: "",
  core_activities: [],
  closing_activities: "",
  diagnostic_assessment: "",
  formative_assessment: "",
  summative_assessment: "",
  media: "",
  sources: "",
  remedial: "",
  enrichment: "",
  kkm_score: "",
  kktp_intervals: [],
  atp_entries: [],
  status: "draft",
};

function toForm(doc: LessonDocument): DesignerFormState {
  return {
    ...EMPTY_FORM,
    ...doc,
    objectives: doc.objectives.join("\n"),
    core_activities: doc.core_activities.map((step) => ({
      phase: step.phase,
      description: step.description,
      duration_min: step.duration_min === null ? "" : String(step.duration_min),
    })),
    kktp_intervals: doc.kktp_intervals.map((interval) => ({
      range_label: interval.range_label,
      description: interval.description,
    })),
    atp_entries: doc.atp_entries.map((entry) => ({
      order: String(entry.order),
      objective: entry.objective,
      content: entry.content,
    })),
    kkm_score: doc.kkm_score === null ? "" : String(doc.kkm_score),
  };
}

function initialFromSearchParams(searchParams: URLSearchParams): DesignerFormState {
  const next = { ...EMPTY_FORM };
  const curriculum = searchParams.get("curriculum");
  if (curriculum && CURRICULA.some((c) => c.id === curriculum)) next.curriculum = curriculum;
  const approach = searchParams.get("approach");
  if (approach && APPROACHES.some((a) => a.id === approach)) next.approach = approach;
  const model = searchParams.get("model");
  if (model && MODELS.some((m) => m.id === model)) next.model = model;
  const method = searchParams.get("method");
  if (method && METHODS.some((m) => m.id === method)) next.method = method;
  const strategy = searchParams.get("strategy");
  if (strategy && STRATEGIES.some((s) => s.id === strategy)) next.strategy = strategy;
  const docType = searchParams.get("doc_type");
  if (docType && docType in DOC_TYPE_LABELS) next.doc_type = docType;
  return next;
}

function buildPayload(form: DesignerFormState) {
  return {
    doc_type: form.doc_type,
    title: form.title.trim(),
    curriculum: form.curriculum,
    level: form.level,
    grade: form.grade,
    phase: form.phase,
    subject: form.subject.trim(),
    time_allocation: form.time_allocation.trim(),
    academic_year: form.academic_year.trim(),
    teacher_name: form.teacher_name.trim(),
    teacher_nip: form.teacher_nip.trim(),
    school_name: form.school_name.trim(),
    approach: form.approach,
    model: form.model,
    method: form.method,
    strategy: form.strategy,
    cp: form.cp.trim(),
    objectives: form.objectives
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    dimensions: form.dimensions,
    panca_cinta: form.panca_cinta,
    source_document_id: form.source_document_id,
    assessment_scope: form.assessment_scope,
    exam_duration: form.exam_duration.trim(),
    assessment_items: form.assessment_items.map((item, i) => ({ ...item, order: i + 1 })),
    scoring_rubric: form.scoring_rubric.filter((row) => row.criterion.trim()),
    meaningful_understanding: form.meaningful_understanding.trim(),
    trigger_questions: form.trigger_questions.trim(),
    intro_activities: form.intro_activities.trim(),
    core_activities: form.core_activities
      .filter((row) => row.phase.trim() || row.description.trim())
      .map((row) => ({
        phase: row.phase.trim(),
        description: row.description.trim(),
        duration_min: row.duration_min.trim() ? Number(row.duration_min) : null,
      })),
    closing_activities: form.closing_activities.trim(),
    diagnostic_assessment: form.diagnostic_assessment.trim(),
    formative_assessment: form.formative_assessment.trim(),
    summative_assessment: form.summative_assessment.trim(),
    media: form.media.trim(),
    sources: form.sources.trim(),
    remedial: form.remedial.trim(),
    enrichment: form.enrichment.trim(),
    kkm_score: form.kkm_score.trim() ? Number(form.kkm_score) : null,
    kktp_intervals: form.kktp_intervals
      .filter((row) => row.range_label.trim() || row.description.trim())
      .map((row) => ({ range_label: row.range_label.trim(), description: row.description.trim() })),
    atp_entries: form.atp_entries
      .filter((row) => row.objective.trim())
      .map((row, i) => ({ order: i + 1, objective: row.objective.trim(), content: row.content.trim() })),
    status: form.status,
  };
}

function buildPreviewDoc(form: DesignerFormState): LessonDocument {
  return {
    ...buildPayload(form),
    id: "preview",
    owner_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as LessonDocument;
}

function InfoBox({
  description,
  syntax,
}: {
  description: string;
  syntax?: string[];
}) {
  return (
    <div className="mt-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-xs leading-relaxed text-[#1E3A8A]">
      <p className="flex items-start gap-1.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {description}
      </p>
      {syntax && syntax.length > 0 && (
        <p className="mt-2 font-semibold">Sintaks:</p>
      )}
      {syntax && syntax.length > 0 && (
        <ol className="mt-1 list-decimal space-y-0.5 pl-4">
          {syntax.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function PedagogySelect({
  testid,
  label,
  value,
  onChange,
  options,
  info,
}: {
  testid: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  info?: { description: string; syntax?: string[] };
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v: string) => onChange(v)}>
        <SelectTrigger data-testid={testid} className="w-full">
          <SelectValue>{options.find((o) => o.id === value)?.name ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {info ? <InfoBox description={info.description} syntax={info.syntax} /> : null}
    </div>
  );
}

function DesignerForm({ docId, initial, profile }: { docId: string | null; initial: DesignerFormState; profile: User | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DesignerFormState>(initial);

  const set = <K extends keyof DesignerFormState>(key: K, value: DesignerFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const levelInfo = findLevel(form.level);
  const subjects = SUBJECTS_BY_LEVEL[form.level] ?? [];

  const onLevelChange = (level: string) => {
    const first = findLevel(level)?.grades[0];
    setForm((prev) => ({ ...prev, level, grade: first?.grade ?? "", phase: first?.phase ?? "" }));
  };

  const onGradeChange = (grade: string) => {
    const phase = levelInfo?.grades.find((g) => g.grade === grade)?.phase ?? form.phase;
    setForm((prev) => ({ ...prev, grade, phase }));
  };

  const previewDoc = useMemo(() => buildPreviewDoc(form), [form]);

  const allDocs = useQuery({
    queryKey: ["documents", "all"],
    queryFn: () => apiGet<LessonDocument[]>("/documents"),
    enabled: form.doc_type === "sumatif" || form.doc_type === "lkpd",
  });
  const sourceOptions = (allDocs.data ?? []).filter((d) => d.doc_type !== "sumatif" && d.doc_type !== "lkpd" && d.id !== docId);
  const sourceDoc = sourceOptions.find((d) => d.id === form.source_document_id);
  const isLkpd = form.doc_type === "lkpd";

  const assessmentEditor = (
    <SumatifEditor
      variant={isLkpd ? "lkpd" : "sumatif"}
      context={{
        subject: form.subject,
        level: form.level,
        grade: form.grade,
        phase: form.phase,
        curriculum: findCurriculum(form.curriculum)?.name ?? form.curriculum,
        cp: form.cp,
        objectives: form.objectives.split("\n").map((l) => l.trim()).filter(Boolean),
        module_content: sourceDoc ? moduleContentOf(sourceDoc) : "",
      }}
      scope={isLkpd ? "LKPD (Lembar Kerja Peserta Didik)" : form.assessment_scope}
      onScopeChange={(v) => set("assessment_scope", v)}
      examDuration={isLkpd ? form.time_allocation : form.exam_duration}
      onExamDurationChange={(v) => set(isLkpd ? "time_allocation" : "exam_duration", v)}
      sourceId={form.source_document_id}
      sourceOptions={sourceOptions}
      onImportSource={importSource}
      items={form.assessment_items}
      onItemsChange={(rows) => set("assessment_items", rows)}
      rubric={form.scoring_rubric}
      onRubricChange={(rows) => set("scoring_rubric", rows)}
    />
  );

  function importSource(doc: LessonDocument) {
    setForm((prev) => ({
      ...prev,
      source_document_id: doc.id,
      curriculum: doc.curriculum,
      level: doc.level,
      grade: doc.grade,
      phase: doc.phase,
      subject: doc.subject,
      school_name: prev.school_name || doc.school_name,
      teacher_name: prev.teacher_name || doc.teacher_name,
      teacher_nip: prev.teacher_nip || doc.teacher_nip,
      academic_year: doc.academic_year || prev.academic_year,
      cp: doc.cp,
      objectives: (doc.objectives.length ? doc.objectives : doc.atp_entries.map((e) => e.objective)).join("\n"),
      title: prev.title || (prev.doc_type === "lkpd" ? `LKPD — ${doc.subject}` : `Asesmen Sumatif ${prev.assessment_scope} — ${doc.subject}`),
    }));
    toast.success("Identitas, CP, dan TP disalin dari dokumen rujukan");
  };

  const save = useMutation({
    mutationFn: (thenPrint: boolean) => {
      if (!form.title.trim()) throw new Error("Judul dokumen wajib diisi (Langkah 1).");
      if (!form.subject.trim()) throw new Error("Mata pelajaran wajib diisi (Langkah 1).");
      const payload = buildPayload(form);
      return docId
        ? apiPut<LessonDocument>(`/documents/${docId}`, payload).then((d) => ({ d, thenPrint }))
        : apiPost<LessonDocument>("/documents", payload).then((d) => ({ d, thenPrint }));
    },
    onSuccess: ({ d, thenPrint }) => {
      toast.success("Dokumen berhasil disimpan");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["document", d.id] });
      navigate(thenPrint ? `/document/${d.id}/print` : "/dashboard");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan dokumen"),
  });

  const autoCompose = () => {
    const model = findModel(form.model);
    if (!model) {
      toast.error("Pilih model pembelajaran terlebih dahulu");
      return;
    }
    set(
      "core_activities",
      model.syntax.map((syntax) => ({ phase: syntax, description: "", duration_min: "" }))
    );
    toast.success(`Sintaks ${model.name} berhasil dimuat`);
  };

  const toggleDimension = (dimension: string, checked: boolean) => {
    set(
      "dimensions",
      checked
        ? [...form.dimensions, dimension]
        : form.dimensions.filter((d) => d !== dimension)
    );
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {docId ? "Edit Perangkat" : "Rancang Perangkat Baru"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Enam langkah menuju dokumen perangkat pembelajaran siap cetak.
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline" data-testid="designer-back-button">
            <ArrowLeft className="mr-1 h-4 w-4" /> Dasbor
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Step timeline */}
        <nav className="lg:col-span-3">
          <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {STEPS.map((title, i) => {
              const n = i + 1;
              const active = step === n;
              return (
                <li key={n} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    data-testid={`wizard-step-${n}-btn`}
                    onClick={() => setStep(n)}
                    className={`flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-600 hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active ? "bg-white/20" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {n}
                    </span>
                    {title}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Form column */}
        <div className="lg:col-span-5" key={step}>
          <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <PedagogySelect
                    testid="wizard-doc-type-select"
                    label="Jenis Dokumen"
                    value={form.doc_type}
                    onChange={(v) => set("doc_type", v)}
                    options={Object.entries(DOC_TYPE_LABELS).map(([id, name]) => ({ id, name }))}
                  />
                  <PedagogySelect
                    testid="wizard-curriculum-select"
                    label="Kurikulum"
                    value={form.curriculum}
                    onChange={(v) => set("curriculum", v)}
                    options={CURRICULA.map((c) => ({ id: c.id, name: c.name }))}
                    info={{
                      description:
                        findCurriculum(form.curriculum)?.description ??
                        "Pilih kurikulum yang menjadi rujukan dokumen.",
                    }}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Jenjang</Label>
                    <Select value={form.level} onValueChange={(v: string) => onLevelChange(v)}>
                      <SelectTrigger data-testid="wizard-level-select" className="w-full">
                        <SelectValue>{form.level}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kelas</Label>
                    <Select value={form.grade} onValueChange={(v: string) => onGradeChange(v)}>
                      <SelectTrigger data-testid="wizard-grade-select" className="w-full">
                        <SelectValue>{form.grade || "Pilih kelas"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(levelInfo?.grades ?? []).map((g) => (
                          <SelectItem key={g.grade} value={g.grade}>
                            Kelas {g.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fase (otomatis)</Label>
                    <Input value={form.phase} readOnly data-testid="wizard-phase-input" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Mata Pelajaran *</Label>
                    <Select
                      value={form.subject}
                      onValueChange={(v: string) => set("subject", v)}
                    >
                      <SelectTrigger data-testid="wizard-subject-input" className="w-full">
                        <SelectValue>{form.subject || "Pilih mata pelajaran"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="allocation">Alokasi Waktu</Label>
                    <Input
                      id="allocation"
                      value={form.time_allocation}
                      onChange={(e) => set("time_allocation", e.target.value)}
                      placeholder="2 x 35 menit"
                      data-testid="wizard-allocation-input"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Judul Dokumen *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Modul Ajar Pecahan Senilai — PBL Fase B"
                    data-testid="wizard-title-input"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher">Nama Guru</Label>
                    <Input
                      id="teacher"
                      value={form.teacher_name}
                      onChange={(e) => set("teacher_name", e.target.value)}
                      data-testid="wizard-teacher-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nip">NIP</Label>
                    <Input
                      id="nip"
                      value={form.teacher_nip}
                      onChange={(e) => set("teacher_nip", e.target.value)}
                      data-testid="wizard-nip-input"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="school">Satuan Pendidikan</Label>
                    <Input
                      id="school"
                      value={form.school_name}
                      onChange={(e) => set("school_name", e.target.value)}
                      data-testid="wizard-school-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="year">Tahun Ajaran</Label>
                    <Input
                      id="year"
                      value={form.academic_year}
                      onChange={(e) => set("academic_year", e.target.value)}
                      data-testid="wizard-year-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <PedagogySelect
                  testid="wizard-approach-select"
                  label="Pendekatan Pembelajaran"
                  value={form.approach}
                  onChange={(v) => set("approach", v)}
                  options={APPROACHES.map((a) => ({ id: a.id, name: a.name }))}
                  info={{ description: findApproach(form.approach)?.description ?? "" }}
                />
                <PedagogySelect
                  testid="wizard-model-select"
                  label="Model Pembelajaran"
                  value={form.model}
                  onChange={(v) => set("model", v)}
                  options={MODELS.map((m) => ({ id: m.id, name: m.name }))}
                  info={{
                    description: findModel(form.model)?.description ?? "",
                    syntax: findModel(form.model)?.syntax,
                  }}
                />
                <PedagogySelect
                  testid="wizard-method-select"
                  label="Metode Pembelajaran"
                  value={form.method}
                  onChange={(v) => set("method", v)}
                  options={METHODS.map((m) => ({ id: m.id, name: m.name }))}
                  info={{
                    description: findMethod(form.method)?.description ?? "",
                  }}
                />
                <PedagogySelect
                  testid="wizard-strategy-select"
                  label="Strategi Pembelajaran"
                  value={form.strategy}
                  onChange={(v) => set("strategy", v)}
                  options={STRATEGIES.map((s) => ({ id: s.id, name: s.name }))}
                  info={{
                    description: findStrategy(form.strategy)?.description ?? "",
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Kombinasi ini menentukan kerangka langkah pembelajaran di Langkah 4 — Anda bisa
                  memuat sintaks model secara otomatis.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cp">
                    {form.curriculum === "k13" ? "Kompetensi Dasar (KD)" : "Capaian Pembelajaran (CP)"}
                  </Label>
                  <Textarea
                    id="cp"
                    rows={3}
                    value={form.cp}
                    onChange={(e) => set("cp", e.target.value)}
                    placeholder="Rujuk CP fase dari Kurikulum Merdeka atau KD dari K13…"
                    data-testid="wizard-cp-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="objectives">
                    {form.doc_type === "atp"
                      ? "Rangkaian Tujuan Pembelajaran (urutan ATP — satu baris satu TP)"
                      : "Tujuan Pembelajaran (satu baris satu TP)"}
                  </Label>
                  <Textarea
                    id="objectives"
                    rows={5}
                    value={form.objectives}
                    onChange={(e) => set("objectives", e.target.value)}
                    placeholder={"Menjelaskan konsep pecahan senilai\nMenemukan hubungan 1/2 = 2/4 melalui peragaan"}
                    data-testid="wizard-objectives-input"
                  />
                </div>
                {form.doc_type !== "atp" && (
                  <div className="space-y-1.5">
                    <Label>Dimensi Profil Lulusan (8 dimensi)</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {GRADUATE_DIMENSIONS.map((dimension, dimIndex) => (
                        <label
                          key={dimension.name}
                          className="flex items-start gap-2 rounded-lg border border-slate-200 p-2.5 text-sm leading-snug transition-colors hover:border-primary"
                        >
                          <Checkbox
                            checked={form.dimensions.includes(dimension.name)}
                            onCheckedChange={(checked) => toggleDimension(dimension.name, checked === true)}
                            data-testid={`wizard-dimension-checkbox-${dimIndex}`}
                          />
                          <span>
                            <span className="font-semibold">{dimension.name}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {dimension.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {form.doc_type !== "atp" && form.doc_type !== "sumatif" && (form.curriculum === "berbasis_cinta" || form.panca_cinta.length > 0) && (
                  <div className="space-y-1.5">
                    <Label>Nilai Panca Cinta (Kurikulum Berbasis Cinta)</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PANCA_CINTA.map((value, idx) => (
                        <label
                          key={value.name}
                          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/40 p-2.5 text-sm leading-snug transition-colors hover:border-rose-400"
                        >
                          <Checkbox
                            checked={form.panca_cinta.includes(value.name)}
                            onCheckedChange={(checked) =>
                              set(
                                "panca_cinta",
                                checked === true
                                  ? [...form.panca_cinta, value.name]
                                  : form.panca_cinta.filter((v) => v !== value.name)
                              )
                            }
                            data-testid={`wizard-panca-cinta-checkbox-${idx}`}
                          />
                          <span>
                            <span className="font-semibold">{value.name}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{value.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="meaningful">Pemahaman Bermakna</Label>
                  <Textarea
                    id="meaningful"
                    rows={2}
                    value={form.meaningful_understanding}
                    onChange={(e) => set("meaningful_understanding", e.target.value)}
                    data-testid="wizard-meaningful-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trigger">Pertanyaan Pemantik</Label>
                  <Textarea
                    id="trigger"
                    rows={2}
                    value={form.trigger_questions}
                    onChange={(e) => set("trigger_questions", e.target.value)}
                    data-testid="wizard-trigger-input"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Muat sintaks{" "}
                    <span className="font-semibold text-foreground">
                      {findModel(form.model)?.name ?? "model"}
                    </span>{" "}
                    lalu uraikan kegiatan tiap tahap.
                  </p>
                  <Button size="sm" onClick={autoCompose} data-testid="wizard-auto-compose-syntax-btn">
                    <Wand2 className="mr-1 h-4 w-4" /> Auto-susun Sintaks
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="intro">Kegiatan Pendahuluan</Label>
                  <Textarea
                    id="intro"
                    rows={3}
                    value={form.intro_activities}
                    onChange={(e) => set("intro_activities", e.target.value)}
                    placeholder="Apersepsi, motivasi, penyampaian tujuan, asesmen awal…"
                    data-testid="wizard-intro-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kegiatan Inti (per sintaks model)</Label>
                  {form.core_activities.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-muted-foreground">
                      Belum ada tahap. Klik "Auto-susun Sintaks" atau tambah manual.
                    </p>
                  )}
                  {form.core_activities.map((row, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                          {i + 1}
                        </span>
                        <Input
                          value={row.phase}
                          onChange={(e) =>
                            set(
                              "core_activities",
                              form.core_activities.map((r, j) =>
                                j === i ? { ...r, phase: e.target.value } : r
                              )
                            )
                          }
                          placeholder={`Tahap / sintaks ${i + 1}`}
                          data-testid={`wizard-core-phase-${i + 1}-input`}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-rose-50 hover:text-destructive"
                          data-testid={`wizard-core-remove-${i + 1}-btn`}
                          onClick={() =>
                            set(
                              "core_activities",
                              form.core_activities.filter((_, j) => j !== i)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        rows={2}
                        value={row.description}
                        onChange={(e) =>
                          set(
                            "core_activities",
                            form.core_activities.map((r, j) =>
                              j === i ? { ...r, description: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Uraikan kegiatan peserta didik pada tahap ini…"
                        data-testid={`wizard-core-description-${i + 1}-input`}
                      />
                      <Input
                        type="number"
                        min={0}
                        value={row.duration_min}
                        onChange={(e) =>
                          set(
                            "core_activities",
                            form.core_activities.map((r, j) =>
                              j === i ? { ...r, duration_min: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Durasi (menit, opsional)"
                        data-testid={`wizard-core-duration-${i + 1}-input`}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="wizard-core-add-btn"
                    onClick={() =>
                      set("core_activities", [
                        ...form.core_activities,
                        { phase: "", description: "", duration_min: "" },
                      ])
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" /> Tambah Tahap
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="closing">Kegiatan Penutup</Label>
                  <Textarea
                    id="closing"
                    rows={3}
                    value={form.closing_activities}
                    onChange={(e) => set("closing_activities", e.target.value)}
                    placeholder="Menyimpulkan bersama, refleksi, umpan balik, tindak lanjut, doa…"
                    data-testid="wizard-closing-input"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                {form.doc_type === "sumatif" ? (
                  assessmentEditor
                ) : form.doc_type === "atp" ? (
                  <div className="space-y-2">
                    <Label>Rincian Alur Tujuan Pembelajaran</Label>
                    <p className="text-xs text-muted-foreground">
                      Rangkaian TP di Langkah 3 menjadi baris ATP. Lengkapi materi pendukung tiap
                      tujuan.
                    </p>
                    {form.atp_entries.length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-muted-foreground">
                        Belum ada baris ATP. Tambahkan di bawah.
                      </p>
                    )}
                    {form.atp_entries.map((row, i) => (
                      <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">TP {i + 1}</Badge>
                          <Input
                            value={row.objective}
                            onChange={(e) =>
                              set(
                                "atp_entries",
                                form.atp_entries.map((r, j) =>
                                  j === i ? { ...r, objective: e.target.value } : r
                                )
                              )
                            }
                            placeholder="Tujuan pembelajaran…"
                            data-testid={`wizard-atp-objective-${i + 1}-input`}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-rose-50 hover:text-destructive"
                            data-testid={`wizard-atp-remove-${i + 1}-btn`}
                            onClick={() =>
                              set("atp_entries", form.atp_entries.filter((_, j) => j !== i))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={row.content}
                          onChange={(e) =>
                            set(
                              "atp_entries",
                              form.atp_entries.map((r, j) =>
                                j === i ? { ...r, content: e.target.value } : r
                              )
                            )
                          }
                          placeholder="Materi / konten pendukung…"
                          data-testid={`wizard-atp-content-${i + 1}-input`}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="wizard-atp-add-btn"
                      onClick={() =>
                        set("atp_entries", [
                          ...form.atp_entries,
                          { order: String(form.atp_entries.length + 1), objective: "", content: "" },
                        ])
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" /> Tambah Baris ATP
                    </Button>
                  </div>
                ) : form.doc_type === "kktp" || form.doc_type === "lkpd" ? (
                  <div className="space-y-4">
                    {form.doc_type === "lkpd" && assessmentEditor}
                    <div className="space-y-1.5">
                      <Label htmlFor="kkm">{form.doc_type === "lkpd" ? "Batas Tuntas KKTP (nilai minimal)" : "Nilai KKM / Batas KKTP"}</Label>
                      <Input
                        id="kkm"
                        type="number"
                        min={0}
                        max={100}
                        value={form.kkm_score}
                        onChange={(e) => set("kkm_score", e.target.value)}
                        placeholder="76"
                        data-testid="wizard-kkm-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interval KKTP & Deskripsi Kriteria</Label>
                      {form.kktp_intervals.map((row, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            className="w-32"
                            value={row.range_label}
                            onChange={(e) =>
                              set(
                                "kktp_intervals",
                                form.kktp_intervals.map((r, j) =>
                                  j === i ? { ...r, range_label: e.target.value } : r
                                )
                              )
                            }
                            placeholder="76 – 90"
                            data-testid={`wizard-kktp-range-${i + 1}-input`}
                          />
                          <Input
                            value={row.description}
                            onChange={(e) =>
                              set(
                                "kktp_intervals",
                                form.kktp_intervals.map((r, j) =>
                                  j === i ? { ...r, description: e.target.value } : r
                                )
                              )
                            }
                            placeholder="Deskripsi kriteria…"
                            data-testid={`wizard-kktp-desc-${i + 1}-input`}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-rose-50 hover:text-destructive"
                            data-testid={`wizard-kktp-remove-${i + 1}-btn`}
                            onClick={() =>
                              set("kktp_intervals", form.kktp_intervals.filter((_, j) => j !== i))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="wizard-kktp-add-btn"
                        onClick={() =>
                          set("kktp_intervals", [
                            ...form.kktp_intervals,
                            { range_label: "", description: "" },
                          ])
                        }
                      >
                        <Plus className="mr-1 h-4 w-4" /> Tambah Interval
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="diagnostic">Asesmen Diagnostik / Awal</Label>
                      <Textarea
                        id="diagnostic"
                        rows={2}
                        value={form.diagnostic_assessment}
                        onChange={(e) => set("diagnostic_assessment", e.target.value)}
                        data-testid="wizard-diagnostic-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="formative">Asesmen Formatif</Label>
                      <Textarea
                        id="formative"
                        rows={2}
                        value={form.formative_assessment}
                        onChange={(e) => set("formative_assessment", e.target.value)}
                        placeholder="Observasi, LKPD, rubrik penilaian…"
                        data-testid="wizard-formative-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="summative">Asesmen Sumatif</Label>
                      <Textarea
                        id="summative"
                        rows={2}
                        value={form.summative_assessment}
                        onChange={(e) => set("summative_assessment", e.target.value)}
                        data-testid="wizard-summative-input"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="media">Media, Alat, dan Bahan Ajar</Label>
                  <Textarea
                    id="media"
                    rows={2}
                    value={form.media}
                    onChange={(e) => set("media", e.target.value)}
                    data-testid="wizard-media-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sources">Sumber Belajar & LKPD</Label>
                  <Textarea
                    id="sources"
                    rows={2}
                    value={form.sources}
                    onChange={(e) => set("sources", e.target.value)}
                    data-testid="wizard-sources-input"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="remedial">Remedial</Label>
                    <Textarea
                      id="remedial"
                      rows={2}
                      value={form.remedial}
                      onChange={(e) => set("remedial", e.target.value)}
                      data-testid="wizard-remedial-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="enrichment">Pengayaan</Label>
                    <Textarea
                      id="enrichment"
                      rows={2}
                      value={form.enrichment}
                      onChange={(e) => set("enrichment", e.target.value)}
                      data-testid="wizard-enrichment-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Periksa pratinjau di samping, lalu simpan dokumen ke akun Anda.
                </p>
                <div className="grid gap-2 text-sm">
                  {[
                    ["Jenis", DOC_TYPE_LABELS[form.doc_type] ?? form.doc_type],
                    ["Kurikulum", findCurriculum(form.curriculum)?.name ?? "-"],
                    ["Mata Pelajaran", form.subject || "-"],
                    ["Jenjang / Kelas", `${form.level}${form.grade ? ` — Kelas ${form.grade}` : ""}`],
                    ["Model Pembelajaran", findModel(form.model)?.name ?? "-"],
                    ["Jumlah TP", `${form.objectives.split("\n").filter((l) => l.trim()).length} tujuan`],
                    ["Tahap Kegiatan Inti", `${form.core_activities.filter((r) => r.phase.trim() || r.description.trim()).length} tahap`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-accent hover:text-accent-foreground"
                    disabled={save.isPending}
                    data-testid="wizard-save-draft-btn"
                    onClick={() => save.mutate(false)}
                  >
                    {save.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                    Simpan Dokumen
                  </Button>
                  <Button disabled={save.isPending} data-testid="wizard-export-print-btn" onClick={() => save.mutate(true)}>
                    <Wand2 className="mr-1 h-4 w-4" /> Simpan & Buka Cetak
                  </Button>
                </div>
              </div>
            )}

            {/* Step navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <Button
                variant="ghost"
                disabled={step === 1}
                data-testid="wizard-prev-step-btn"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya
              </Button>
              <Button
                disabled={step === STEPS.length}
                data-testid="wizard-next-step-btn"
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              >
                Lanjutnya <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Live preview dock */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pratinjau langsung
            </p>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3">
              <div className="origin-top scale-[0.55] sm:scale-[0.6] lg:scale-[0.52]">
                <DocumentSheet doc={previewDoc} profile={profile} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Designer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: fetchMe, retry: false });
  const docQuery = useQuery({
    queryKey: ["document", id],
    queryFn: () => apiGet<LessonDocument>(`/documents/${id}`),
    enabled: Boolean(id),
  });

  if (id && docQuery.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (id && !docQuery.data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="font-heading text-lg font-semibold">Dokumen tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Dokumen mungkin telah dihapus atau bukan milik akun ini.
        </p>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button variant="outline" className="border-primary text-primary hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Dasbor
          </Button>
        </Link>
      </div>
    );
  }

  const initial = docQuery.data
    ? toForm(docQuery.data)
    : {
        ...initialFromSearchParams(searchParams),
        teacher_name: me.data?.name ?? "",
        teacher_nip: me.data?.nip ?? "",
        school_name: me.data?.school ?? "",
      };
  return <DesignerForm key={id ?? "new"} docId={id ?? null} initial={initial} profile={me.data ?? null} />;
}
