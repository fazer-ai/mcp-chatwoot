import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "audit_logs_list",
    {
      title: "List Audit Logs",
      description: "List audit log events for the account",
      inputSchema: {
        account_id: accountId,
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v1/accounts/${account_id}/audit_logs`,
        params,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
