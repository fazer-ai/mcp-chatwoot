import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/canned_responses`;

  server.registerTool(
    "canned_responses_list",
    {
      title: "List Canned Responses",
      description: "List all pre-defined canned responses for the account",
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
    "canned_responses_create",
    {
      title: "Create Canned Response",
      description: "Create a new canned response",
      inputSchema: {
        account_id: accountId,
        short_code: z.string().describe("Short code to trigger the response"),
        content: z.string().describe("The response content"),
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
    "canned_responses_update",
    {
      title: "Update Canned Response",
      description: "Update an existing canned response",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Canned response ID"),
        short_code: z.string().optional().describe("Short code"),
        content: z.string().optional().describe("Response content"),
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
    "canned_responses_delete",
    {
      title: "Delete Canned Response",
      description: "Delete a canned response",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Canned response ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, id }) => {
      await client.delete(`${base(account_id)}/${id}`);
      return {
        content: [
          { type: "text", text: "Canned response deleted successfully" },
        ],
      };
    },
  );
};
