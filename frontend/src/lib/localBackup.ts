import { currentAccount } from "./localAccounts";
import { loadState, nowIso, saveState } from "./localStore";
import type { BackupStatus } from "./types";

const REMINDER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getBackupStatus(): BackupStatus {
  const account = currentAccount(loadState());
  const last = account.last_backup_at;
  const daysSince = last === null ? null : Math.floor((Date.now() - Date.parse(last)) / DAY_MS);
  return {
    last_backup_at: last,
    days_since: daysSince,
    due: daysSince === null || daysSince >= REMINDER_DAYS,
    reminder_days: REMINDER_DAYS,
  };
}

export function markBackup(): BackupStatus {
  const state = loadState();
  const account = currentAccount(state);
  account.last_backup_at = nowIso();
  saveState(state);
  return getBackupStatus();
}
