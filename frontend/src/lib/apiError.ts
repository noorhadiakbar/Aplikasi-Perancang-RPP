// Error shape used by the in-browser data layer; pages read `body.detail` for the message.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function fail(status: number, detail: string): never {
  throw new ApiError(status, { detail });
}
