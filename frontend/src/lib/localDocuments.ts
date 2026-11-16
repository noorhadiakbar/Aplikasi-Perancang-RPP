import { fail } from "./apiError";
import { currentAccount } from "./localAccounts";
import { loadState, newId, nowIso, saveState, type LocalState } from "./localStore";
import type { LessonDocument } from "./types";

const DOC_TYPES = ["modul_ajar", "rpp", "atp", "kktp", "lkpd", "sumatif"];

type DocumentFields = Omit<LessonDocument, "id" | "owner_id" | "created_at" | "updated_at">;
export type DocumentBody = Partial<DocumentFields>;

function blankFields(): DocumentFields {
  return {
    doc_type: "modul_ajar",
    title: "",
    curriculum: "merdeka",
    level: "SD",
    grade: "",
    phase: "",
    subject: "",
    time_allocation: "",
    academic_year: "",
    teacher_name: "",
    teacher_nip: "",
    school_name: "",
    approach: "",
    model: "",
    method: "",
    strategy: "",
    cp: "",
    objectives: [],
    dimensions: [],
    meaningful_understanding: "",
    trigger_questions: "",
    intro_activities: "",
    core_activities: [],
    closing_activities: "",
    diagnostic_assessment: "",
    formative_assessment: "",
    summative_assessment: "",
    source_document_id: null,
    assessment_scope: "",
    exam_duration: "",
    panca_cinta: [],
    assessment_items: [],
    scoring_rubric: [],
    media: "",
    sources: "",
    remedial: "",
    enrichment: "",
    kkm_score: null,
    kktp_intervals: [],
    atp_entries: [],
    status: "draft",
  };
}

function validateType(docType: string): void {
  if (!DOC_TYPES.includes(docType)) fail(422, "Jenis dokumen tidak dikenal.");
}

export function ownedDocument(state: LocalState, ownerId: string, docId: string): LessonDocument {
  const doc = state.documents.find((d) => d.id === docId && d.owner_id === ownerId);
  if (!doc) fail(404, "Dokumen tidak ditemukan.");
  return doc;
}

export function listDocuments(params: URLSearchParams): LessonDocument[] {
  const state = loadState();
  const owner = currentAccount(state);
  const docType = params.get("doc_type");
  const level = params.get("level");
  const q = (params.get("q") ?? "").trim().toLowerCase();
  if (docType) validateType(docType);

  return state.documents
    .filter((d) => d.owner_id === owner.id)
    .filter((d) => !docType || d.doc_type === docType)
    .filter((d) => !level || d.level === level)
    .filter((d) => !q || d.title.toLowerCase().includes(q))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getDocument(id: string): LessonDocument {
  const state = loadState();
  return ownedDocument(state, currentAccount(state).id, id);
}

export function createDocument(body: DocumentBody): LessonDocument {
  const state = loadState();
  const owner = currentAccount(state);
  const docType = body.doc_type ?? "modul_ajar";
  validateType(docType);

  const now = nowIso();
  const doc: LessonDocument = {
    ...blankFields(),
    ...body,
    doc_type: docType,
    id: newId(),
    owner_id: owner.id,
    created_at: now,
    updated_at: now,
  };
  state.documents.push(doc);
  saveState(state);
  return doc;
}

export function updateDocument(id: string, body: DocumentBody): LessonDocument {
  const state = loadState();
  const owner = currentAccount(state);
  const existing = ownedDocument(state, owner.id, id);
  if (body.doc_type !== undefined) validateType(body.doc_type);

  const updated: LessonDocument = {
    ...existing,
    ...body,
    id: existing.id,
    owner_id: existing.owner_id,
    created_at: existing.created_at,
    updated_at: nowIso(),
  };
  state.documents = state.documents.map((d) => (d.id === id ? updated : d));
  saveState(state);
  return updated;
}

export function deleteDocument(id: string): void {
  const state = loadState();
  const owner = currentAccount(state);
  ownedDocument(state, owner.id, id);
  state.documents = state.documents.filter((d) => d.id !== id);
  state.submissions = state.submissions.filter((s) => s.document_id !== id);
  saveState(state);
}
