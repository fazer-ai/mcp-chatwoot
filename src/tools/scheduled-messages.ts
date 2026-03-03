import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number, conversationId: number) =>
    `/api/v1/accounts/${accountId}/conversations/${conversationId}/scheduled_messages`;

  server.registerTool(
    "scheduled_messages_list",
    {
      title: "List Scheduled Messages",
      description: "[fazer.ai] List scheduled messages for a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: z.number().describe("Conversation ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, conversation_id }) => {
      const result = await client.get(base(account_id, conversation_id));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "scheduled_messages_create",
    {
      title: "Create Scheduled Message",
      description:
        "[fazer.ai] Schedule a message to be sent later in a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: z.number().describe("Conversation ID"),
        content: z.string().describe("Message content"),
        scheduled_at: z
          .string()
          .describe("ISO 8601 datetime for when to send the message"),
        message_type: z
          .enum(["outgoing", "incoming"])
          .optional()
          .describe("Message type"),
      },
    },
    async ({ account_id, conversation_id, ...body }) => {
      const result = await client.post(base(account_id, conversation_id), body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "scheduled_messages_update",
    {
      title: "Update Scheduled Message",
      description: "[fazer.ai] Update a scheduled message",
      inputSchema: {
        account_id: accountId,
        conversation_id: z.number().describe("Conversation ID"),
        scheduled_message_id: z.number().describe("Scheduled message ID"),
        content: z.string().optional().describe("Message content"),
        scheduled_at: z.string().optional().describe("ISO 8601 datetime"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, conversation_id, scheduled_message_id, ...body }) => {
      const result = await client.patch(
        `${base(account_id, conversation_id)}/${scheduled_message_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "scheduled_messages_delete",
    {
      title: "Delete Scheduled Message",
      description: "[fazer.ai] Delete a scheduled message",
      inputSchema: {
        account_id: accountId,
        conversation_id: z.number().describe("Conversation ID"),
        scheduled_message_id: z.number().describe("Scheduled message ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, conversation_id, scheduled_message_id }) => {
      await client.delete(
        `${base(account_id, conversation_id)}/${scheduled_message_id}`,
      );
      return {
        content: [
          { type: "text", text: "Scheduled message deleted successfully" },
        ],
      };
    },
  );
};
