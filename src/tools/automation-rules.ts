import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/automation_rules`;

  server.registerTool(
    "automation_rules_list",
    {
      title: "List Automation Rules",
      description: "List all automation rules for the account",
      inputSchema: {
        account_id: accountId,
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(base(account_id), params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "automation_rules_create",
    {
      title: "Create Automation Rule",
      description: "Create a new automation rule",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Rule name"),
        description: z.string().optional().describe("Rule description"),
        event_name: z
          .string()
          .describe(
            "Event that triggers the rule (e.g. conversation_created, message_created)",
          ),
        conditions: z.any().optional().describe("JSON conditions for the rule"),
        actions: z.any().optional().describe("JSON actions for the rule"),
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
    "automation_rules_get",
    {
      title: "Get Automation Rule",
      description: "Get a specific automation rule",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Automation rule ID"),
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
    "automation_rules_update",
    {
      title: "Update Automation Rule",
      description: "Update an existing automation rule",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Automation rule ID"),
        name: z.string().optional().describe("Rule name"),
        description: z.string().optional().describe("Rule description"),
        event_name: z.string().optional().describe("Event trigger"),
        conditions: z.any().optional().describe("JSON conditions"),
        actions: z.any().optional().describe("JSON actions"),
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
    "automation_rules_delete",
    {
      title: "Delete Automation Rule",
      description: "Delete an automation rule",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Automation rule ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, id }) => {
      await client.delete(`${base(account_id)}/${id}`);
      return {
        content: [
          { type: "text", text: "Automation rule deleted successfully" },
        ],
      };
    },
  );
};
