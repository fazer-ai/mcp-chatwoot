import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "integrations_list_apps",
    {
      title: "List Integration Apps",
      description: "List all available third-party integration apps",
      inputSchema: { account_id: accountId },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(
        `/api/v1/accounts/${account_id}/integrations/apps`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "integrations_create_hook",
    {
      title: "Create Integration Hook",
      description: "Create an integration hook (webhook for integration)",
      inputSchema: {
        account_id: accountId,
        app_id: z.string().describe("Integration app ID"),
        settings: z
          .record(z.string(), z.any())
          .optional()
          .describe("Integration settings"),
      },
    },
    async ({ account_id, ...body }) => {
      const result = await client.post(
        `/api/v1/accounts/${account_id}/integrations/hooks`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "integrations_update_hook",
    {
      title: "Update Integration Hook",
      description: "Update an integration hook",
      inputSchema: {
        account_id: accountId,
        hook_id: z.number().describe("Hook ID"),
        settings: z
          .record(z.string(), z.any())
          .optional()
          .describe("Integration settings"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, hook_id, ...body }) => {
      const result = await client.patch(
        `/api/v1/accounts/${account_id}/integrations/hooks/${hook_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "integrations_delete_hook",
    {
      title: "Delete Integration Hook",
      description: "Delete an integration hook",
      inputSchema: {
        account_id: accountId,
        hook_id: z.number().describe("Hook ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, hook_id }) => {
      await client.delete(
        `/api/v1/accounts/${account_id}/integrations/hooks/${hook_id}`,
      );
      return {
        content: [
          { type: "text", text: "Integration hook deleted successfully" },
        ],
      };
    },
  );
};
