import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ChatwootClient } from "./client.ts";
import { registerAllTools } from "./tools/index.ts";

export function createServer(client: ChatwootClient): McpServer {
  const server = new McpServer(
    {
      name: "mcp-chatwoot",
      version: "1.0.0",
    },
    {
      capabilities: {
        logging: {},
      },
    },
  );

  registerAllTools(server, client);

  return server;
}
