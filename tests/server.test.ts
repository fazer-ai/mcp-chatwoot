import { describe, expect, test } from "bun:test";
import { ChatwootClient } from "../src/client.ts";
import { createServer } from "../src/server.ts";

describe("Server", () => {
  test("creates server with all tools registered", () => {
    const client = new ChatwootClient(
      "https://chatwoot.example.com",
      "test-token",
    );
    const server = createServer(client);

    // The server should have been created successfully
    expect(server).toBeDefined();
  });

  test("registers all 129 tools", () => {
    const client = new ChatwootClient(
      "https://chatwoot.example.com",
      "test-token",
    );
    const server = createServer(client);

    // biome-ignore lint/suspicious/noExplicitAny: accessing internal properties for testing
    const tools = (server as any)._registeredTools;
    expect(Object.keys(tools).length).toBe(129);
  });

  test("has fazer.ai exclusive tools", () => {
    const client = new ChatwootClient(
      "https://chatwoot.example.com",
      "test-token",
    );
    const server = createServer(client);

    // biome-ignore lint/suspicious/noExplicitAny: accessing internal properties for testing
    const tools = (server as any)._registeredTools;

    // Kanban tools
    expect(tools.kanban_boards_list).toBeDefined();
    expect(tools.kanban_steps_list).toBeDefined();
    expect(tools.kanban_tasks_list).toBeDefined();
    expect(tools.kanban_audit_events_list).toBeDefined();
    expect(tools.kanban_preferences_get).toBeDefined();

    // Scheduled messages
    expect(tools.scheduled_messages_list).toBeDefined();
  });
});
