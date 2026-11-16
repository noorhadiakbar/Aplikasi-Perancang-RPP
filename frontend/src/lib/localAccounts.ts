import { fail } from "./apiError";
import { loadState, newId, nowIso, saveState, type LocalState, type StoredAccount } from "./localStore";
import type { ProfileUpdate, User } from "./types";

const PBKDF2_ITERATIONS = 210_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginBody {
  email?: string;
  password?: string;
}

export interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  school?: string;
  nip?: string;
}

const toHex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex: string): Uint8Array => Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));

async function derivePassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, key, 256);
  return toHex(new Uint8Array(bits));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toHex(salt)}:${await derivePassword(password, salt)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, expected] = stored.split(":");
  if (!saltHex || !expected) return false;
  return (await derivePassword(password, fromHex(saltHex))) === expected;
}

function toUser(account: StoredAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    school: account.school,
    nip: account.nip,
    school_address: account.school_address,
    npsn: account.npsn,
    city: account.city,
    principal_name: account.principal_name,
    principal_nip: account.principal_nip,
    logo: account.logo,
  };
}

export function currentAccount(state: LocalState): StoredAccount {
  const account = state.accounts.find((a) => a.id === state.sessionUserId);
  if (!account) fail(401, "Belum masuk. Silakan login terlebih dahulu.");
  return account;
}

export function getMe(): User {
  return toUser(currentAccount(loadState()));
}

export async function registerAccount(body: RegisterBody): Promise<User> {
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (name.length < 2) fail(422, "Nama minimal 2 karakter.");
  if (!EMAIL_PATTERN.test(email)) fail(422, "Format email tidak valid.");
  if (password.length < 8) fail(422, "Kata sandi minimal 8 karakter.");

  const password_hash = await hashPassword(password);
  const state = loadState();
  if (state.accounts.some((a) => a.email === email)) fail(409, "Email sudah terdaftar. Silakan masuk.");

  const account: StoredAccount = {
    id: newId(),
    name,
    email,
    school: body.school ?? "",
    nip: body.nip ?? "",
    school_address: "",
    npsn: "",
    city: "",
    principal_name: "",
    principal_nip: "",
    logo: "",
    password_hash,
    last_backup_at: null,
  };
  state.accounts.push(account);
  state.sessionUserId = account.id;
  saveState(state);
  return toUser(account);
}

export async function loginAccount(body: LoginBody): Promise<User> {
  const state = loadState();
  const email = (body.email ?? "").trim().toLowerCase();
  const account = state.accounts.find((a) => a.email === email);
  if (!account || !(await verifyPassword(body.password ?? "", account.password_hash))) {
    fail(401, "Email atau kata sandi salah.");
  }
  state.sessionUserId = account.id;
  saveState(state);
  return toUser(account);
}

export function logout(): void {
  const state = loadState();
  state.sessionUserId = null;
  saveState(state);
}

export function updateProfile(body: Partial<ProfileUpdate>): User {
  const state = loadState();
  const account = currentAccount(state);
  const name = (body.name ?? account.name).trim();
  if (name.length < 2) fail(422, "Nama minimal 2 karakter.");
  if (body.logo && !body.logo.startsWith("data:image/")) fail(422, "Logo harus berupa gambar (PNG, JPG, atau WEBP).");

  account.name = name;
  account.school = body.school ?? account.school;
  account.nip = body.nip ?? account.nip;
  account.school_address = body.school_address ?? account.school_address;
  account.npsn = body.npsn ?? account.npsn;
  account.city = body.city ?? account.city;
  account.principal_name = body.principal_name ?? account.principal_name;
  account.principal_nip = body.principal_nip ?? account.principal_nip;
  account.logo = body.logo ?? account.logo;
  saveState(state);
  return toUser(account);
}
