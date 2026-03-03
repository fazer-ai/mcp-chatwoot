import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/agents`;

  server.registerTool(
    "agents_list",
    {
      title: "List Agents",
      description: "List all agents in the account",
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
    "agents_create",
    {
      title: "Create Agent",
      description: "Add a new agent to the account",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Agent name"),
        email: z.string().describe("Agent email"),
        role: z
          .enum(["agent", "administrator"])
          .optional()
          .describe("Agent role"),
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
    "agents_update",
    {
      title: "Update Agent",
      description: "Update an agent in the account",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Agent ID"),
        name: z.string().optional().describe("Agent name"),
        role: z
          .enum(["agent", "administrator"])
          .optional()
          .describe("Agent role"),
        availability: z
          .enum(["online", "offline", "busy"])
          .optional()
          .describe("Availability status"),
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
    "agents_delete",
    {
      title: "Delete Agent",
      description: "Remove an agent from the account",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Agent ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, id }) => {
      await client.delete(`${base(account_id)}/${id}`);
      return {
        content: [{ type: "text", text: "Agent deleted successfully" }],
      };
    },
  );
};
