import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/contacts`;

  server.registerTool(
    "contacts_list",
    {
      title: "List Contacts",
      description: "List contacts in the account with pagination",
      inputSchema: {
        account_id: accountId,
        page: z.number().optional().describe("Page number (default 1)"),
        sort: z
          .enum([
            "name",
            "email",
            "phone_number",
            "last_activity_at",
            "created_at",
          ])
          .optional()
          .describe("Sort field"),
        order_by: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
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
    "contacts_create",
    {
      title: "Create Contact",
      description:
        "Create a new contact with name, phone (E.164), email, and custom attributes",
      inputSchema: {
        account_id: accountId,
        name: z.string().optional().describe("Contact name"),
        email: z.string().optional().describe("Contact email"),
        phone_number: z
          .string()
          .optional()
          .describe("Phone number in E.164 format (e.g. +5511999999999)"),
        identifier: z.string().optional().describe("External identifier"),
        custom_attributes: z
          .record(z.string(), z.any())
          .optional()
          .describe("Custom attributes as key-value pairs"),
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
    "contacts_get",
    {
      title: "Get Contact",
      description: "Get a specific contact by ID",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Contact ID"),
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
    "contacts_update",
    {
      title: "Update Contact",
      description: "Update an existing contact",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Contact ID"),
        name: z.string().optional().describe("Contact name"),
        email: z.string().optional().describe("Contact email"),
        phone_number: z.string().optional().describe("Phone in E.164 format"),
        identifier: z.string().optional().describe("External identifier"),
        custom_attributes: z
          .record(z.string(), z.any())
          .optional()
          .describe("Custom attributes"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, id, ...body }) => {
      const result = await client.put(`${base(account_id)}/${id}`, body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contacts_delete",
    {
      title: "Delete Contact",
      description: "Delete a contact",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Contact ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, id }) => {
      await client.delete(`${base(account_id)}/${id}`);
      return {
        content: [{ type: "text", text: "Contact deleted successfully" }],
      };
    },
  );

  server.registerTool(
    "contacts_conversations",
    {
      title: "List Contact Conversations",
      description: "List all conversations for a specific contact",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Contact ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, id }) => {
      const result = await client.get(
        `${base(account_id)}/${id}/conversations`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contacts_search",
    {
      title: "Search Contacts",
      description:
        "Search contacts by query string (searches name, email, phone, identifier)",
      inputSchema: {
        account_id: accountId,
        q: z.string().describe("Search query"),
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(`${base(account_id)}/search`, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contacts_filter",
    {
      title: "Filter Contacts",
      description:
        "Filter contacts using advanced filter conditions (POST with payload)",
      inputSchema: {
        account_id: accountId,
        payload: z
          .array(z.any())
          .describe(
            "Array of filter objects with attribute_key, filter_operator, values, query_operator",
          ),
      },
    },
    async ({ account_id, payload }) => {
      const result = await client.post(`${base(account_id)}/filter`, {
        payload,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contacts_create_contact_inbox",
    {
      title: "Create Contact Inbox",
      description: "Create a contact inbox association (link contact to inbox)",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Contact ID"),
        inbox_id: z.number().describe("Inbox ID"),
      },
    },
    async ({ account_id, id, inbox_id }) => {
      const result = await client.post(
        `${base(account_id)}/${id}/contact_inboxes`,
        { inbox_id },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contacts_contactable_inboxes",
    {
      title: "List Contactable Inboxes",
      description:
        "Get list of inboxes that can be used to reach a specific contact",
      inputSchema: {
        account_id: accountId,
        id: z.number().describe("Contact ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, id }) => {
      const result = await client.get(
        `${base(account_id)}/${id}/contactable_inboxes`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "contacts_merge",
    {
      title: "Merge Contacts",
      description:
        "Merge two contacts together. The base contact is kept y the mergee is merged into it.",
      inputSchema: {
        account_id: accountId,
        base_contact_id: z.number().describe("The contact ID to keep (base)"),
        mergee_contact_id: z
          .number()
          .describe("The contact ID to merge and remove"),
      },
    },
    async ({ account_id, base_contact_id, mergee_contact_id }) => {
      const result = await client.post(
        `/api/v1/accounts/${account_id}/actions/contact_merge`,
        { base_contact_id, mergee_contact_id },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
