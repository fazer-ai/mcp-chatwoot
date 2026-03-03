/**
 * Chatwoot API HTTP client.
 *
 * Thin wrapper around `fetch` that handles authentication,
 * JSON serialisation and error extraction.
 */

export class ChatwootApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: string[],
  ) {
    super(message);
    this.name = "ChatwootApiError";
  }
}

export class ChatwootClient {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(baseUrl: string, apiToken: string) {
    // Strip trailing slash so callers can use `/api/v1/…` directly
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiToken = apiToken;
  }

  // ── HTTP helpers ──────────────────────────────────────────────

  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: "GET" });
  }

  async post<T = unknown>(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, { method: "DELETE" });
  }

  // ── Internal ──────────────────────────────────────────────────

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Api-Access-Token", this.apiToken);

    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      const apiErrors = await this.extractErrors(response);
      const message =
        apiErrors.length > 0
          ? apiErrors.join("; ")
          : `Chatwoot API error: ${response.status} ${response.statusText}`;
      throw new ChatwootApiError(message, response.status, apiErrors);
    }

    // Some DELETE endpoints return 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Extracts error messages from a Chatwoot error response.
   * Mirrors the pattern from the n8n node's chatwootApiRequest.
   */
  private async extractErrors(response: Response): Promise<string[]> {
    try {
      const data = (await response.json()) as Record<string, unknown>;
      if (Array.isArray(data.errors)) {
        return data.errors.map(String);
      }
      if (typeof data.error === "string") {
        return [data.error];
      }
      if (typeof data.message === "string") {
        return [data.message];
      }
    } catch {
      // Response body was not JSON — ignore
    }
    return [];
  }
}
