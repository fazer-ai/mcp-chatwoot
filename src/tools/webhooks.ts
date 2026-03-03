import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/webhooks`;

  server.registerTool(
    "webhooks_list",
    {
      title: "List Webhooks",
      description: "List all webhooks configured in the account",
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
    "webhooks_create",
    {
      title: "Create Webhook",
      description:
        "Create a new webhook that receives event notifications at the given URL",
      inputSchema: {
        account_id: accountId,
        url: z.string().describe("Webhook endpoint URL"),
        subscriptions: z
          .array(z.string())
          .optional()
          .describe(
            "Event types to subscribe to (e.g. conversation_created, message_created)",
          ),
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
    "webhooks_update",
    {
      title: "Update Webhook",
      description: "Update a webhook URL or subscriptions",
      inputSchema: {
        account_id: accountId,
        webhook_id: z.number().describe("Webhook ID"),
        url: z.string().optional().describe("Webhook endpoint URL"),
        subscriptions: z
          .array(z.string())
          .optional()
          .describe("Event types to subscribe to"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, webhook_id, ...body }) => {
      const result = await client.patch(
        `${base(account_id)}/${webhook_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "webhooks_delete",
    {
      title: "Delete Webhook",
      description: "Delete a webhook",
      inputSchema: {
        account_id: accountId,
        webhook_id: z.number().describe("Webhook ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, webhook_id }) => {
      await client.delete(`${base(account_id)}/${webhook_id}`);
      return {
        content: [{ type: "text", text: "Webhook deleted successfully" }],
      };
    },
  );
};
