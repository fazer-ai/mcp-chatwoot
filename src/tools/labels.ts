import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "labels_list",
    {
      title: "List Labels",
      description: "List all labels available in the account",
      inputSchema: {
        account_id: accountId,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(`/api/v1/accounts/${account_id}/labels`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
