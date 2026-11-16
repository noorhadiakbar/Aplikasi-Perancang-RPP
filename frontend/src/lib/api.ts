// In-browser stand-in for the former /api backend: every request is answered from localStorage.
import { ApiError } from "./apiError";
import { getMe, loginAccount, logout, registerAccount, updateProfile, type LoginBody, type RegisterBody } from "./localAccounts";
import { getBackupStatus, markBackup } from "./localBackup";
import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument, type DocumentBody } from "./localDocuments";
import { deleteSubmission, gradeStudents, listSubmissions, updateSubmission } from "./localLkpd";
import type { GradeIn, ProfileUpdate, SubmissionUpdate } from "./types";

type JsonBody = unknown;


interface Route {
  method: string;
  pattern: RegExp;
  handler: (ids: string[], query: URLSearchParams, body: unknown) => unknown;
}

const routes: Route[] = [
  { method: "GET", pattern: /^\/auth\/me$/, handler: () => getMe() },
  { method: "POST", pattern: /^\/auth\/register$/, handler: (_, __, body) => registerAccount(body as RegisterBody) },
  { method: "POST", pattern: /^\/auth\/login$/, handler: (_, __, body) => loginAccount(body as LoginBody) },
  { method: "POST", pattern: /^\/auth\/logout$/, handler: () => logout() },
  { method: "PUT", pattern: /^\/auth\/profile$/, handler: (_, __, body) => updateProfile(body as Partial<ProfileUpdate>) },
  { method: "GET", pattern: /^\/documents$/, handler: (_, query) => listDocuments(query) },
  { method: "POST", pattern: /^\/documents$/, handler: (_, __, body) => createDocument(body as DocumentBody) },
  { method: "GET", pattern: /^\/documents\/([^/]+)$/, handler: ([id]) => getDocument(id) },
  { method: "PUT", pattern: /^\/documents\/([^/]+)$/, handler: ([id], _, body) => updateDocument(id, body as DocumentBody) },
  { method: "DELETE", pattern: /^\/documents\/([^/]+)$/, handler: ([id]) => deleteDocument(id) },
  { method: "GET", pattern: /^\/backup\/status$/, handler: () => getBackupStatus() },
  { method: "POST", pattern: /^\/backup\/mark$/, handler: () => markBackup() },
  { method: "POST", pattern: /^\/lkpd\/([^/]+)\/grade$/, handler: ([id], _, body) => gradeStudents(id, [body as GradeIn])[0] },
  {
    method: "POST",
    pattern: /^\/lkpd\/([^/]+)\/grade-bulk$/,
    handler: ([id], _, body) => gradeStudents(id, (body as { students?: GradeIn[] }).students ?? []),
  },
  { method: "GET", pattern: /^\/lkpd\/([^/]+)\/submissions$/, handler: ([id]) => listSubmissions(id) },
  { method: "PUT", pattern: /^\/lkpd\/submissions\/([^/]+)$/, handler: ([id], _, body) => updateSubmission(id, body as SubmissionUpdate) },
  { method: "DELETE", pattern: /^\/lkpd\/submissions\/([^/]+)$/, handler: ([id]) => deleteSubmission(id) },
];

async function request<T>(method: string, path: string, body?: JsonBody): Promise<T> {
  const url = new URL(path, "http://local.invalid");
  for (const route of routes) {
    const match = route.method === method ? route.pattern.exec(url.pathname) : null;
    if (match) return (await route.handler(match.slice(1), url.searchParams, body)) as T;
  }
  throw new ApiError(404, { detail: "Fitur ini belum tersedia di versi browser." });
}

// The response type is yours to declare: nothing infers across the data layer boundary, so a
// TS interface here mirrors the stored shape by hand — keep the two in sync.
export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: JsonBody) => request<T>("POST", path, body ?? null);
export const apiPut = <T>(path: string, body?: JsonBody) => request<T>("PUT", path, body ?? null);
export const apiPatch = <T>(path: string, body?: JsonBody) => request<T>("PATCH", path, body ?? null);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
