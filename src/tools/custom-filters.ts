import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/custom_filters`;

  server.registerTool(
    "custom_filters_list",
    {
      title: "List Custom Filters",
      description: "List all saved custom filters for conversations",
      inputSchema: {
        account_id: accountId,
        filter_type: z
          .enum(["conversation", "contact", "report"])
          .optional()
          .describe("Filter type"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(base(account_id), params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "custom_filters_create",
    {
      title: "Create Custom Filter",
      description: "Create a new custom filter for conversations",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Filter name"),
        filter_type: z
          .enum(["conversation", "contact", "report"])
          .describe("Filter type"),
        query: z.any().describe("Filter query definition (JSON)"),
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
    "custom_filters_get",
    {
      title: "Get Custom Filter",
      description: "Get a specific custom filter",
      inputSchema: {
        account_id: accountId,
        custom_filter_id: z.number().describe("Custom filter ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, custom_filter_id }) => {
      const result = await client.get(
        `${base(account_id)}/${custom_filter_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "custom_filters_update",
    {
      title: "Update Custom Filter",
      description: "Update an existing custom filter",
      inputSchema: {
        account_id: accountId,
        custom_filter_id: z.number().describe("Custom filter ID"),
        name: z.string().optional().describe("Filter name"),
        query: z.any().optional().describe("Filter query definition (JSON)"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, custom_filter_id, ...body }) => {
      const result = await client.patch(
        `${base(account_id)}/${custom_filter_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "custom_filters_delete",
    {
      title: "Delete Custom Filter",
      description: "Delete a custom filter",
      inputSchema: {
        account_id: accountId,
        custom_filter_id: z.number().describe("Custom filter ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, custom_filter_id }) => {
      await client.delete(`${base(account_id)}/${custom_filter_id}`);
      return {
        content: [{ type: "text", text: "Custom filter deleted successfully" }],
      };
    },
  );
};
