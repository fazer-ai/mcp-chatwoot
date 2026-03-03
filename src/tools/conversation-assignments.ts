import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "conversation_assignments_assign",
    {
      title: "Assign Conversation",
      description: "Assign a conversation to an agent and/or team",
      inputSchema: {
        account_id: accountId,
        conversation_id: z.number().describe("Conversation ID"),
        assignee_id: z
          .number()
          .optional()
          .describe("Agent ID to assign (null to unassign)"),
        team_id: z
          .number()
          .optional()
          .describe("Team ID to assign (null to unassign)"),
      },
    },
    async ({ account_id, conversation_id, ...body }) => {
      const result = await client.post(
        `/api/v1/accounts/${account_id}/conversations/${conversation_id}/assignments`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
