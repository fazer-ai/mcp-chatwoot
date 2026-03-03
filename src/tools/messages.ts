import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");
const conversationId = z.number().describe("The conversation ID");

export const register: RegisterFn = (server, client) => {
  const base = (aId: number, cId: number) =>
    `/api/v1/accounts/${aId}/conversations/${cId}/messages`;

  server.registerTool(
    "messages_list",
    {
      title: "List Messages",
      description: "List messages in a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
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
    "messages_create",
    {
      title: "Send Message",
      description: "Send a message in a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        content: z.string().describe("Message content"),
        message_type: z
          .enum(["outgoing", "incoming"])
          .optional()
          .describe("Message type (default: outgoing)"),
        private: z
          .boolean()
          .optional()
          .describe("Whether this is a private/internal note"),
        content_type: z
          .enum(["text", "input_select", "cards", "form"])
          .optional()
          .describe("Content type"),
        content_attributes: z
          .record(z.string(), z.any())
          .optional()
          .describe("Content attributes for rich messages"),
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
    "messages_delete",
    {
      title: "Delete Message",
      description: "Delete a message from a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        message_id: z.number().describe("Message ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, conversation_id, message_id }) => {
      await client.delete(`${base(account_id, conversation_id)}/${message_id}`);
      return {
        content: [{ type: "text", text: "Message deleted successfully" }],
      };
    },
  );
};
