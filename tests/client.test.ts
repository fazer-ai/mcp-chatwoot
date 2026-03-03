import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ChatwootApiError, ChatwootClient } from "../src/client.ts";

const BASE_URL = "https://chatwoot.example.com";
const API_TOKEN = "test-token-123";

function mockResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function installMock(fn: () => Promise<Response>) {
  const m = mock(fn);
  // biome-ignore lint/suspicious/noExplicitAny: mock fetch override
  globalThis.fetch = m as any;
  return m;
}

describe("ChatwootClient", () => {
  let client: ChatwootClient;

  beforeEach(() => {
    client = new ChatwootClient(BASE_URL, API_TOKEN);
  });

  test("strips trailing slashes from baseUrl", async () => {
    const clientWithSlash = new ChatwootClient(
      "https://chatwoot.example.com///",
      API_TOKEN,
    );

    const m = installMock(() => Promise.resolve(mockResponse({ ok: true })));
    await clientWithSlash.get("/api/v1/test");

    const calledUrl = String((m.mock.calls as unknown[][])[0]?.[0] ?? "");
    expect(calledUrl).toStartWith("https://chatwoot.example.com/api/v1/test");
  });

  test("sends Api-Access-Token header on requests", async () => {
    const m = installMock(() => Promise.resolve(mockResponse({})));
    await client.get("/api/v1/accounts/1");

    const init = (m.mock.calls as unknown[][])[0]?.[1] as
      | RequestInit
      | undefined;
    expect(init?.headers).toBeDefined();
    const headers = new Headers(init?.headers);
    expect(headers.get("Api-Access-Token")).toBe(API_TOKEN);
  });

  test("GET appends query params", async () => {
    const m = installMock(() => Promise.resolve(mockResponse({})));

    await client.get("/api/v1/accounts/1/conversations", {
      page: 2,
      status: "open",
    });

    const calledUrl = String((m.mock.calls as unknown[][])[0]?.[0] ?? "");
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("status=open");
  });

  test("GET skips undefined query params", async () => {
    const m = installMock(() => Promise.resolve(mockResponse({})));

    await client.get("/api/v1/test", {
      page: 1,
      filter: undefined,
    });

    const calledUrl = String((m.mock.calls as unknown[][])[0]?.[0] ?? "");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).not.toContain("filter");
  });

  test("POST sends JSON body", async () => {
    const m = installMock(() => Promise.resolve(mockResponse({ id: 1 })));

    await client.post("/api/v1/accounts/1/contacts", {
      name: "Test User",
      email: "test@example.com",
    });

    const init = (m.mock.calls as unknown[][])[0]?.[1] as
      | RequestInit
      | undefined;
    expect(init?.method).toBe("POST");
    const headers = new Headers(init?.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init?.body as string)).toEqual({
      name: "Test User",
      email: "test@example.com",
    });
  });

  test("PATCH sends JSON body", async () => {
    const m = installMock(() => Promise.resolve(mockResponse({ id: 1 })));

    await client.patch("/api/v1/accounts/1/contacts/1", { name: "Updated" });

    const init = (m.mock.calls as unknown[][])[0]?.[1] as
      | RequestInit
      | undefined;
    expect(init?.method).toBe("PATCH");
  });

  test("DELETE returns on 204 No Content", async () => {
    installMock(() => Promise.resolve(new Response(null, { status: 204 })));

    const result = await client.delete("/api/v1/accounts/1/contacts/1");
    expect(result).toBeUndefined();
  });

  test("throws ChatwootApiError on error response with errors array", async () => {
    installMock(() =>
      Promise.resolve(
        mockResponse(
          { errors: ["Name is required", "Email is invalid"] },
          { status: 422 },
        ),
      ),
    );

    try {
      await client.post("/api/v1/accounts/1/contacts", {});
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ChatwootApiError);
      const apiError = error as ChatwootApiError;
      expect(apiError.status).toBe(422);
      expect(apiError.errors).toEqual(["Name is required", "Email is invalid"]);
    }
  });

  test("throws ChatwootApiError with error string", async () => {
    installMock(() =>
      Promise.resolve(mockResponse({ error: "Unauthorized" }, { status: 401 })),
    );

    try {
      await client.get("/api/v1/accounts/1");
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ChatwootApiError);
      const apiError = error as ChatwootApiError;
      expect(apiError.status).toBe(401);
      expect(apiError.errors).toEqual(["Unauthorized"]);
    }
  });

  test("throws ChatwootApiError with message fallback", async () => {
    installMock(() =>
      Promise.resolve(mockResponse({ message: "Not found" }, { status: 404 })),
    );

    try {
      await client.get("/api/v1/missing");
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ChatwootApiError);
      const apiError = error as ChatwootApiError;
      expect(apiError.status).toBe(404);
      expect(apiError.errors).toEqual(["Not found"]);
    }
  });

  test("throws ChatwootApiError with statusText when no body parseable", async () => {
    installMock(() =>
      Promise.resolve(
        new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        }),
      ),
    );

    try {
      await client.get("/api/v1/broken");
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ChatwootApiError);
      const apiError = error as ChatwootApiError;
      expect(apiError.status).toBe(500);
    }
  });
});
