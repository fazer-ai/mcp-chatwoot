import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "account_get",
    {
      title: "Get Account",
      description: "Retrieve information about the specified Chatwoot account",
      inputSchema: { account_id: accountId },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(`/api/v1/accounts/${account_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "account_update",
    {
      title: "Update Account",
      description: "Update attributes of the specified Chatwoot account",
      inputSchema: {
        account_id: accountId,
        name: z.string().optional().describe("Account name"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, ...body }) => {
      const result = await client.patch(`/api/v1/accounts/${account_id}`, body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
