import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number, boardId: number) =>
    `/api/v1/accounts/${accountId}/kanban_boards/${boardId}/kanban_audit_events`;

  server.registerTool(
    "kanban_audit_events_list",
    {
      title: "List Kanban Audit Events",
      description:
        "[fazer.ai] List audit events (activity log) for a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id, ...params }) => {
      const result = await client.get(base(account_id, board_id), params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_audit_events_get",
    {
      title: "Get Kanban Audit Event",
      description: "[fazer.ai] Get a specific audit event from a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        event_id: z.number().describe("Audit event ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id, event_id }) => {
      const result = await client.get(
        `${base(account_id, board_id)}/${event_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
