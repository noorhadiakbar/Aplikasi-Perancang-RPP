// Hand-written mirrors of the Pydantic models in backend/models/ — nothing infers across
// the HTTP boundary, so keeping these in sync is manual discipline.

export interface SyntaxStep {
  phase: string;
  description: string;
  duration_min: number | null;
}

export interface ATPEntry {
  order: number;
  objective: string;
  content: string;
}

export interface KKTPInterval {
  range_label: string;
  description: string;
}

// Mirror of backend/models/document.py::AssessmentItem — butir kisi-kisi & soal sumatif
export interface AssessmentItem {
  order: number;
  objective: string;
  indicator: string;
  cognitive_level: string;
  content: string;
  question_type: string;
  question: string;
  answer: string;
  points: number;
}

// Mirror of backend/models/document.py::RubricRow — rubrik penilaian 4 level
export interface RubricRow {
  criterion: string;
  excellent: string;
  good: string;
  adequate: string;
  needs_guidance: string;
}

// Mirror of backend/models/document.py::LessonDocument
export interface LessonDocument {
  id: string;
  owner_id: string;
  doc_type: string; // modul_ajar | rpp | atp | kktp
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
  objectives: string[];
  dimensions: string[];
  meaningful_understanding: string;
  trigger_questions: string;
  intro_activities: string;
  core_activities: SyntaxStep[];
  closing_activities: string;
  diagnostic_assessment: string;
  formative_assessment: string;
  summative_assessment: string;
  source_document_id: string | null;
  assessment_scope: string;
  exam_duration: string;
  panca_cinta: string[];
  assessment_items: AssessmentItem[];
  scoring_rubric: RubricRow[];
  media: string;
  sources: string;
  remedial: string;
  enrichment: string;
  kkm_score: number | null;
  kktp_intervals: KKTPInterval[];
  atp_entries: ATPEntry[];
  status: string; // draft | final
  created_at: string;
  updated_at: string;
}

// Mirror of backend/models/assessment.py::GenerateAssessmentIn
export interface GenerateAssessmentIn {
  subject: string;
  level: string;
  grade: string;
  phase: string;
  curriculum: string;
  assessment_scope: string;
  cp: string;
  objectives: string[];
  module_content: string;
  num_multiple_choice: number;
  num_essay: number;
}

// Mirror of backend/models/assessment.py::GenerateAssessmentOut
export interface GenerateAssessmentOut {
  items: AssessmentItem[];
  rubric: RubricRow[];
  model_used: string;
}

// Mirror of backend/models/auth.py::UserOut (ProfileFields + id/email)
export interface User {
  id: string;
  name: string;
  email: string;
  school: string;
  nip: string;
  school_address: string;
  npsn: string;
  city: string;
  principal_name: string;
  principal_nip: string;
  logo: string; // data URL (PNG/JPG/WEBP) or ""
}

// Mirror of backend/models/auth.py::ProfileUpdate
export type ProfileUpdate = Omit<User, "id" | "email">;

// Mirrors of backend/models/lkpd.py
export interface StudentAnswerIn {
  order: number;
  answer: string;
}

export interface GradeIn {
  student_name: string;
  student_class: string;
  answers: StudentAnswerIn[];
}

export interface GradedAnswer {
  order: number;
  question_type: string;
  answer: string;
  key: string;
  score: number;
  max_score: number;
  correct: boolean | null;
  feedback: string;
  graded_by: string; // auto | ai | guru | perlu_guru
}

export interface SubmissionUpdate {
  scores: { order: number; score: number; feedback?: string | null }[];
}

export interface LkpdSubmission {
  id: string;
  owner_id: string;
  document_id: string;
  student_name: string;
  student_class: string;
  answers: GradedAnswer[];
  total_score: number;
  max_score: number;
  final_score: number;
  kkm: number;
  passed: boolean;
  kktp_label: string;
  kktp_description: string;
  created_at: string;
  updated_at: string;
}

// Mirror of backend/models/lkpd.py::BulkGradeIn
export interface BulkGradeIn {
  students: GradeIn[];
}

// Mirror of backend/routers/backup.py::BackupStatus
export interface BackupStatus {
  last_backup_at: string | null;
  days_since: number | null;
  due: boolean;
  reminder_days: number;
}

// Mirror of backend/routers/backup.py::ImportResult
export interface ImportResult {
  documents_added: number;
  documents_updated: number;
  documents_skipped: number;
  submissions_added: number;
  profile_restored: boolean;
}
