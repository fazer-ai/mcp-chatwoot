import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/agent_bots`;

  server.registerTool(
    "agent_bots_list",
    {
      title: "List Agent Bots",
      description: "List all agent bots for the account",
      inputSchema: { account_id: accountId },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(base(account_id));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "agent_bots_create",
    {
      title: "Create Agent Bot",
      description: "Create a new agent bot for the account",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Name of the agent bot"),
        description: z.string().optional().describe("Description"),
        outgoing_url: z.string().optional().describe("Webhook URL for the bot"),
      },
    },
    async ({ account_id, ...body }) => {
      const result = await client.post(base(account_id), body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "agent_bots_get",
    {
      title: "Get Agent Bot",
      description: "Get details of a specific agent bot",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Agent bot ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, id }) => {
      const result = await client.get(`${base(account_id)}/${id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "agent_bots_update",
    {
      title: "Update Agent Bot",
      description: "Update an existing agent bot",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Agent bot ID"),
        name: z.string().optional().describe("Name of the agent bot"),
        description: z.string().optional().describe("Description"),
        outgoing_url: z.string().optional().describe("Webhook URL for the bot"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, id, ...body }) => {
      const result = await client.patch(`${base(account_id)}/${id}`, body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "agent_bots_delete",
    {
      title: "Delete Agent Bot",
      description: "Delete an agent bot from the account",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Agent bot ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, id }) => {
      await client.delete(`${base(account_id)}/${id}`);
      return {
        content: [{ type: "text", text: "Agent bot deleted successfully" }],
      };
    },
  );
};
