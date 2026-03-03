import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/inboxes`;

  server.registerTool(
    "inboxes_list",
    {
      title: "List Inboxes",
      description: "List all communication channel inboxes in the account",
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
    "inboxes_get",
    {
      title: "Get Inbox",
      description: "Get information about a specific inbox",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Inbox ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, id }) => {
      const result = await client.get(`${base(account_id)}/${id}/`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inboxes_create",
    {
      title: "Create Inbox",
      description:
        "Create a new inbox (channel). The channel object varies by type.",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Inbox name"),
        channel: z
          .record(z.string(), z.any())
          .describe(
            "Channel configuration object (varies by type: web_widget, api, email, etc.)",
          ),
      },
    },
    async ({ account_id, ...body }) => {
      const result = await client.post(`${base(account_id)}/`, body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inboxes_update",
    {
      title: "Update Inbox",
      description: "Update an inbox",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Inbox ID"),
        name: z.string().optional().describe("Inbox name"),
        enable_auto_assignment: z
          .boolean()
          .optional()
          .describe("Enable auto-assignment"),
        channel: z
          .record(z.string(), z.any())
          .optional()
          .describe("Channel configuration"),
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
    "inboxes_get_agent_bot",
    {
      title: "Get Inbox Agent Bot",
      description: "Get the agent bot associated with an inbox",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Inbox ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, id }) => {
      const result = await client.get(`${base(account_id)}/${id}/agent_bot`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inboxes_set_agent_bot",
    {
      title: "Set Inbox Agent Bot",
      description: "Set or unset the agent bot for an inbox",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Inbox ID"),
        agent_bot: z
          .number()
          .nullable()
          .describe("Agent bot ID (null to unset)"),
      },
    },
    async ({ account_id, id, agent_bot }) => {
      const result = await client.post(
        `${base(account_id)}/${id}/set_agent_bot`,
        { agent_bot },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inbox_members_list",
    {
      title: "List Inbox Members",
      description: "List agents assigned to an inbox",
      inputSchema: {
        account_id: accountId,
        inbox_id: z.number().describe("Inbox ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, inbox_id }) => {
      const result = await client.get(
        `/api/v1/accounts/${account_id}/inbox_members/${inbox_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inbox_members_create",
    {
      title: "Add Inbox Members",
      description: "Add agents to an inbox",
      inputSchema: {
        account_id: accountId,
        inbox_id: z.number().describe("Inbox ID"),
        user_ids: z.array(z.number()).describe("Array of agent IDs to add"),
      },
    },
    async ({ account_id, inbox_id, user_ids }) => {
      const result = await client.post(
        `/api/v1/accounts/${account_id}/inbox_members`,
        { inbox_id, user_ids },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inbox_members_update",
    {
      title: "Update Inbox Members",
      description:
        "Replace all agents in an inbox (removes agents not in list)",
      inputSchema: {
        account_id: accountId,
        inbox_id: z.number().describe("Inbox ID"),
        user_ids: z
          .array(z.number())
          .describe("Array of agent IDs (replaces existing list)"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, inbox_id, user_ids }) => {
      const result = await client.patch(
        `/api/v1/accounts/${account_id}/inbox_members`,
        { inbox_id, user_ids },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "inbox_members_delete",
    {
      title: "Remove Inbox Members",
      description: "Remove agents from an inbox",
      inputSchema: {
        account_id: accountId,
        inbox_id: z.number().describe("Inbox ID"),
        user_ids: z.array(z.number()).describe("Array of agent IDs to remove"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, inbox_id: _inbox_id, user_ids: _user_ids }) => {
      const result = await client.delete(
        `/api/v1/accounts/${account_id}/inbox_members`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
