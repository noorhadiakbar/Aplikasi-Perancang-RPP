import { fail } from "./apiError";
import { currentAccount } from "./localAccounts";
import { ownedDocument } from "./localDocuments";
import { loadState, newId, nowIso, saveState, type LocalState } from "./localStore";
import type { AssessmentItem, GradeIn, GradedAnswer, KKTPInterval, LessonDocument, LkpdSubmission, SubmissionUpdate } from "./types";

const DEFAULT_KKM = 75;
const MAX_BULK_STUDENTS = 60;
const AUTO_TYPES = ["pilihan_ganda", "isian", "menjodohkan"];
const RANGE_PATTERN = /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function firstLetter(value: string): string {
  return value.trim().charAt(0).toUpperCase();
}

function autoGrade(item: AssessmentItem, answer: string): GradedAnswer {
  const base = { order: item.order, question_type: item.question_type, answer, key: item.answer, max_score: item.points };
  if (!AUTO_TYPES.includes(item.question_type)) {
    return { ...base, score: 0, correct: null, feedback: "Menunggu penilaian guru.", graded_by: "perlu_guru" };
  }
  const correct =
    item.question_type === "pilihan_ganda"
      ? firstLetter(answer) !== "" && firstLetter(answer) === firstLetter(item.answer)
      : normalizeText(answer) !== "" && normalizeText(answer) === normalizeText(item.answer);
  return { ...base, score: correct ? item.points : 0, correct, feedback: "", graded_by: "auto" };
}

function findInterval(intervals: KKTPInterval[], score: number): KKTPInterval | undefined {
  return intervals.find((iv) => {
    const match = RANGE_PATTERN.exec(iv.range_label);
    if (!match) return false;
    const low = Number(match[1].replace(",", "."));
    const high = Number(match[2].replace(",", "."));
    return score >= low && score <= high;
  });
}

function summarize(answers: GradedAnswer[], doc: Pick<LessonDocument, "kkm_score" | "kktp_intervals">) {
  const total = answers.reduce((sum, a) => sum + a.score, 0);
  const max = answers.reduce((sum, a) => sum + a.max_score, 0);
  const finalScore = max > 0 ? Math.round((total / max) * 10000) / 100 : 0;
  const kkm = doc.kkm_score ?? DEFAULT_KKM;
  const interval = findInterval(doc.kktp_intervals, Math.round(finalScore));
  return {
    total_score: total,
    max_score: max,
    final_score: finalScore,
    kkm,
    passed: finalScore >= kkm,
    kktp_label: interval?.range_label ?? "",
    kktp_description: interval?.description ?? "",
  };
}

function ownedSubmission(state: LocalState, ownerId: string, submissionId: string): LkpdSubmission {
  const sub = state.submissions.find((s) => s.id === submissionId && s.owner_id === ownerId);
  if (!sub) fail(404, "Nilai tidak ditemukan.");
  return sub;
}

function gradeOne(ownerId: string, doc: LessonDocument, input: GradeIn): LkpdSubmission {
  const name = (input.student_name ?? "").trim();
  if (!name) fail(422, "Nama siswa wajib diisi.");
  const answers = [...doc.assessment_items]
    .sort((a, b) => a.order - b.order)
    .map((item) => autoGrade(item, input.answers?.find((a) => a.order === item.order)?.answer ?? ""));
  const now = nowIso();
  return {
    id: newId(),
    owner_id: ownerId,
    document_id: doc.id,
    student_name: name,
    student_class: (input.student_class ?? "").trim(),
    answers,
    ...summarize(answers, doc),
    created_at: now,
    updated_at: now,
  };
}

function requireLkpd(state: LocalState, ownerId: string, docId: string): LessonDocument {
  const doc = ownedDocument(state, ownerId, docId);
  if (doc.doc_type !== "lkpd") fail(422, "Dokumen ini bukan LKPD.");
  if (doc.assessment_items.length === 0) fail(422, "LKPD ini belum memiliki soal.");
  return doc;
}

export function gradeStudents(docId: string, students: GradeIn[]): LkpdSubmission[] {
  if (students.length < 1 || students.length > MAX_BULK_STUDENTS) {
    fail(422, `Jumlah siswa harus antara 1 sampai ${MAX_BULK_STUDENTS}.`);
  }
  const state = loadState();
  const owner = currentAccount(state);
  const doc = requireLkpd(state, owner.id, docId);
  const graded = students.map((student) => gradeOne(owner.id, doc, student));
  state.submissions.push(...graded);
  saveState(state);
  return graded;
}

export function listSubmissions(docId: string): LkpdSubmission[] {
  const state = loadState();
  const owner = currentAccount(state);
  ownedDocument(state, owner.id, docId);
  return state.submissions.filter((s) => s.document_id === docId && s.owner_id === owner.id);
}

export function updateSubmission(submissionId: string, update: SubmissionUpdate): LkpdSubmission {
  const state = loadState();
  const owner = currentAccount(state);
  const sub = ownedSubmission(state, owner.id, submissionId);
  const doc = ownedDocument(state, owner.id, sub.document_id);

  const answers = sub.answers.map((answer) => {
    const change = update.scores.find((s) => s.order === answer.order);
    if (!change) return answer;
    if (change.score < 0 || change.score > answer.max_score) fail(422, "Nilai melebihi skor maksimum soal.");
    return {
      ...answer,
      score: change.score,
      correct: answer.max_score > 0 ? change.score >= answer.max_score : null,
      feedback: change.feedback ?? "",
      graded_by: "guru",
    };
  });
  const updated: LkpdSubmission = { ...sub, answers, ...summarize(answers, doc), updated_at: nowIso() };
  state.submissions = state.submissions.map((s) => (s.id === submissionId ? updated : s));
  saveState(state);
  return updated;
}

export function deleteSubmission(submissionId: string): void {
  const state = loadState();
  const owner = currentAccount(state);
  ownedSubmission(state, owner.id, submissionId);
  state.submissions = state.submissions.filter((s) => s.id !== submissionId);
  saveState(state);
}
