// Session boundary helper: "who am I" returns null instead of throwing on 401 so
// callers can render guest vs guru states without a failed-request error.
import { apiGet } from "./api";
import { ApiError } from "./apiError";
import type { User } from "./types";

export async function fetchMe(): Promise<User | null> {
  try {
    return await apiGet<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
