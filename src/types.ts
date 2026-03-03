/**
 * Shared type definitions for the Chatwoot MCP server.
 *
 * These mirror the shapes returned by the Chatwoot REST API and are used
 * for internal type-safety only — tool responses are returned as raw JSON text.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ChatwootClient } from "@/client.ts";

/** Signature every tool module must export. */
export type RegisterFn = (server: McpServer, client: ChatwootClient) => void;
