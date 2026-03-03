import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");
const conversationId = z.number().describe("The conversation ID");

export const register: RegisterFn = (server, client) => {
  const base = (aId: number) => `/api/v1/accounts/${aId}/conversations`;

  server.registerTool(
    "conversations_meta",
    {
      title: "Conversations Meta",
      description:
        "Get conversation metadata (counts by status: open, unassigned, assigned, etc.)",
      inputSchema: { account_id: accountId },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(`${base(account_id)}/meta`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_list",
    {
      title: "List Conversations",
      description: "List conversations with optional filters",
      inputSchema: {
        account_id: accountId,
        assignee_type: z
          .enum(["me", "unassigned", "all", "assigned"])
          .optional()
          .describe("Filter by assignee type"),
        status: z
          .enum(["open", "resolved", "pending", "snoozed", "all"])
          .optional()
          .describe("Filter by status"),
        inbox_id: z.number().optional().describe("Filter by inbox ID"),
        team_id: z.number().optional().describe("Filter by team ID"),
        labels: z
          .array(z.string())
          .optional()
          .describe("Filter by label names"),
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, labels, ...params }) => {
      const queryParams: Record<string, string | number | boolean | undefined> =
        { ...params };
      if (labels?.length) {
        queryParams.labels = labels.join(",");
      }
      const result = await client.get(base(account_id), queryParams);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_create",
    {
      title: "Create Conversation",
      description: "Create a new conversation",
      inputSchema: {
        account_id: accountId,
        source_id: z.string().optional().describe("Source ID of the contact"),
        inbox_id: z.number().describe("Inbox ID"),
        contact_id: z.number().describe("Contact ID"),
        status: z
          .enum(["open", "resolved", "pending"])
          .optional()
          .describe("Initial status"),
        assignee_id: z
          .number()
          .optional()
          .describe("Agent to assign the conversation to"),
        team_id: z
          .number()
          .optional()
          .describe("Team to assign the conversation to"),
        message: z
          .object({
            content: z.string().describe("Initial message content"),
          })
          .optional()
          .describe("Initial message to send"),
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
    "conversations_filter",
    {
      title: "Filter Conversations",
      description: "Filter conversations with advanced filter conditions",
      inputSchema: {
        account_id: accountId,
        payload: z
          .array(z.any())
          .describe(
            "Array of filter objects with attribute_key, filter_operator, values, query_operator",
          ),
        page: z.number().optional().describe("Page number"),
      },
    },
    async ({ account_id, payload, page }) => {
      const result = await client.post(`${base(account_id)}/filter`, {
        payload,
        page,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_get",
    {
      title: "Get Conversation",
      description: "Get a specific conversation by ID",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, conversation_id }) => {
      const result = await client.get(`${base(account_id)}/${conversation_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_update",
    {
      title: "Update Conversation",
      description: "Update conversation attributes",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        custom_attributes: z
          .record(z.string(), z.any())
          .optional()
          .describe("Custom attributes"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, conversation_id, ...body }) => {
      const result = await client.patch(
        `${base(account_id)}/${conversation_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_toggle_status",
    {
      title: "Toggle Conversation Status",
      description:
        "Change conversation status (open, resolved, pending, snoozed)",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        status: z
          .enum(["open", "resolved", "pending", "snoozed"])
          .describe("New status"),
      },
    },
    async ({ account_id, conversation_id, status }) => {
      const result = await client.post(
        `${base(account_id)}/${conversation_id}/toggle_status`,
        { status },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_toggle_priority",
    {
      title: "Set Conversation Priority",
      description: "Set the priority of a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        priority: z
          .enum(["none", "low", "medium", "high", "urgent"])
          .describe("Priority level"),
      },
    },
    async ({ account_id, conversation_id, priority }) => {
      const result = await client.post(
        `${base(account_id)}/${conversation_id}/toggle_priority`,
        { priority: priority === "none" ? null : priority },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_set_custom_attributes",
    {
      title: "Set Conversation Custom Attributes",
      description: "Set custom attributes on a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        custom_attributes: z
          .record(z.string(), z.any())
          .describe("Custom attributes as key-value pairs"),
      },
    },
    async ({ account_id, conversation_id, custom_attributes }) => {
      const result = await client.post(
        `${base(account_id)}/${conversation_id}/custom_attributes`,
        { custom_attributes },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_get_labels",
    {
      title: "Get Conversation Labels",
      description: "Get labels assigned to a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, conversation_id }) => {
      const result = await client.get(
        `${base(account_id)}/${conversation_id}/labels`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_set_labels",
    {
      title: "Set Conversation Labels",
      description: "Replace all labels on a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
        labels: z.array(z.string()).describe("Array of label names to set"),
      },
    },
    async ({ account_id, conversation_id, labels }) => {
      const result = await client.post(
        `${base(account_id)}/${conversation_id}/labels`,
        { labels },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "conversations_reporting_events",
    {
      title: "List Conversation Reporting Events",
      description: "Get reporting events for a conversation",
      inputSchema: {
        account_id: accountId,
        conversation_id: conversationId,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, conversation_id }) => {
      const result = await client.get(
        `${base(account_id)}/${conversation_id}/reporting_events`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
