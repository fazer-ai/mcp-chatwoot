import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) =>
    `/api/v1/accounts/${id}/custom_attribute_definitions`;

  server.registerTool(
    "custom_attributes_list",
    {
      title: "List Custom Attributes",
      description: "List all custom attribute definitions for the account",
      inputSchema: {
        account_id: accountId,
        attribute_model: z
          .enum(["conversation_attribute", "contact_attribute"])
          .optional()
          .describe("Filter by model type"),
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
    "custom_attributes_create",
    {
      title: "Create Custom Attribute",
      description:
        "Create a custom attribute definition (text, number, date, list, checkbox, link)",
      inputSchema: {
        account_id: accountId,
        attribute_display_name: z
          .string()
          .describe("Display name of the attribute"),
        attribute_display_type: z
          .enum([
            "text",
            "number",
            "currency",
            "percent",
            "link",
            "date",
            "list",
            "checkbox",
          ])
          .describe("The data type of the attribute"),
        attribute_description: z
          .string()
          .optional()
          .describe("Description of the attribute"),
        attribute_model: z
          .enum(["conversation_attribute", "contact_attribute"])
          .describe("Whether this applies to conversations or contacts"),
        attribute_key: z.string().describe("Unique key for the attribute"),
        attribute_values: z
          .array(z.string())
          .optional()
          .describe("Possible values (for list type)"),
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
    "custom_attributes_get",
    {
      title: "Get Custom Attribute",
      description: "Get a specific custom attribute definition",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Custom attribute definition ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, id }) => {
      const result = await client.get(`${base(account_id)}/${id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "custom_attributes_update",
    {
      title: "Update Custom Attribute",
      description: "Update a custom attribute definition",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Custom attribute definition ID"),
        attribute_display_name: z.string().optional().describe("Display name"),
        attribute_description: z.string().optional().describe("Description"),
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
    "custom_attributes_delete",
    {
      title: "Delete Custom Attribute",
      description: "Delete a custom attribute definition",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Custom attribute definition ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, id }) => {
      await client.delete(`${base(account_id)}/${id}`);
      return {
        content: [
          { type: "text", text: "Custom attribute deleted successfully" },
        ],
      };
    },
  );
};
