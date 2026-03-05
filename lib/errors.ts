export class MalApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "MalApiError";
  }

  static fromResponse(status: number, body: unknown): MalApiError {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: string }).message)
        : `MAL API error (${status})`;
    return new MalApiError(status, message, body);
  }
}

export class MalAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalAuthError";
  }
}
