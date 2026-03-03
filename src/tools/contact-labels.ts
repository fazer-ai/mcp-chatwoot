import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "contact_labels_list",
    {
      title: "List Contact Labels",
      description: "List all labels assigned to a contact",
      inputSchema: {
        account_id: accountId,
        contact_id: z.number().describe("Contact ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, contact_id }) => {
      const result = await client.get(
        `/api/v1/accounts/${account_id}/contacts/${contact_id}/labels`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contact_labels_set",
    {
      title: "Set Contact Labels",
      description:
        "Replace all labels on a contact with the provided list of labels",
      inputSchema: {
        account_id: accountId,
        contact_id: z.number().describe("Contact ID"),
        labels: z.array(z.string()).describe("Array of label names to set"),
      },
    },
    async ({ account_id, contact_id, labels }) => {
      const result = await client.post(
        `/api/v1/accounts/${account_id}/contacts/${contact_id}/labels`,
        { labels },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
