import { fail } from "./apiError";
import type { LessonDocument, LkpdSubmission, User } from "./types";

export interface StoredAccount extends User {
  password_hash: string;
  last_backup_at: string | null;
}

export interface LocalState {
  accounts: StoredAccount[];
  sessionUserId: string | null;
  documents: LessonDocument[];
  submissions: LkpdSubmission[];
}

const STORAGE_KEY = "perancangrpp:v1";

function emptyState(): LocalState {
  return { accounts: [], sessionUserId: null, documents: [], submissions: [] };
}

export function loadState(): LocalState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState();
  try {
    return { ...emptyState(), ...(JSON.parse(raw) as Partial<LocalState>) };
  } catch {
    return emptyState();
  }
}

export function saveState(state: LocalState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    fail(507, "Penyimpanan browser penuh. Hapus sebagian data atau unduh cadangan.");
  }
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
