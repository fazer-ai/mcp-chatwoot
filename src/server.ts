import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ChatwootClient } from "@/client.ts";
import config from "@/config.ts";
import { registerAllTools } from "@/tools/index.ts";

export function createServer(client: ChatwootClient): McpServer {
  const server = new McpServer(
    {
      name: config.packageInfo.name,
      version: config.packageInfo.version,
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
