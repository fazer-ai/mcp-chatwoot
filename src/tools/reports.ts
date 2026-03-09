import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  // --- Reports V2 ---

  server.registerTool(
    "reports_account_overview",
    {
      title: "Account Metrics",
      description: "Get account-level conversation metrics",
      inputSchema: {
        account_id: accountId,
        type: z
          .enum(["account"])
          .default("account")
          .describe("Report type (always 'account')"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, type }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/reports`,
        { type },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "reports_account_summary",
    {
      title: "Account Summary",
      description:
        "Get account summary (conversations count, incoming messages, etc.) for a time range",
      inputSchema: {
        account_id: accountId,
        since: z.string().describe("Start date/time (epoch or ISO 8601)"),
        until: z.string().describe("End date/time (epoch or ISO 8601)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/reports/summary`,
        { type: "account", ...params },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "reports_agent_summary",
    {
      title: "Agent Summary",
      description: "Get agent-level summary statistics for a time range",
      inputSchema: {
        account_id: accountId,
        since: z.string().describe("Start date/time"),
        until: z.string().describe("End date/time"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/summary_reports/agent`,
        params,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "reports_conversation_metrics",
    {
      title: "Conversation Metrics",
      description:
        "Get conversation-level metrics (resolution time, first response, etc.)",
      inputSchema: {
        account_id: accountId,
        type: z
          .enum(["account", "agent", "inbox", "team", "label"])
          .optional()
          .describe("Group results by type"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/reports/conversations`,
        params,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "reports_v2_agents",
    {
      title: "Reports V2 Agents",
      description: "Get v2 agent performance reports",
      inputSchema: {
        account_id: accountId,
        since: z.string().describe("Start date (ISO 8601)"),
        until: z.string().describe("End date (ISO 8601)"),
        group_by: z
          .enum(["day", "week", "month", "year"])
          .optional()
          .describe("Grouping interval"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/summary_reports/agent`,
        params,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "reports_v2_inboxes",
    {
      title: "Reports V2 Inboxes",
      description: "Get v2 inbox performance reports",
      inputSchema: {
        account_id: accountId,
        since: z.string().describe("Start date (ISO 8601)"),
        until: z.string().describe("End date (ISO 8601)"),
        group_by: z
          .enum(["day", "week", "month", "year"])
          .optional()
          .describe("Grouping interval"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/summary_reports/inbox`,
        params,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "reports_v2_teams",
    {
      title: "Reports V2 Teams",
      description: "Get v2 team performance reports",
      inputSchema: {
        account_id: accountId,
        since: z.string().describe("Start date (ISO 8601)"),
        until: z.string().describe("End date (ISO 8601)"),
        group_by: z
          .enum(["day", "week", "month", "year"])
          .optional()
          .describe("Grouping interval"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, ...params }) => {
      const result = await client.get(
        `/api/v2/accounts/${account_id}/summary_reports/team`,
        params,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
