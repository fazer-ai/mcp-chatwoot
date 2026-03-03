import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number, boardId: number) =>
    `/api/v1/accounts/${accountId}/kanban_boards/${boardId}/kanban_steps`;

  server.registerTool(
    "kanban_steps_list",
    {
      title: "List Kanban Steps",
      description: "[fazer.ai] List all steps in a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id }) => {
      const result = await client.get(base(account_id, board_id));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_steps_create",
    {
      title: "Create Kanban Step",
      description: "[fazer.ai] Create a new step (column) in a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        name: z.string().describe("Step name"),
        description: z.string().optional().describe("Step description"),
        color: z.string().optional().describe("Step color (hex)"),
        cancelled: z
          .boolean()
          .optional()
          .describe("Whether this step represents a cancelled state"),
      },
    },
    async ({ account_id, board_id, ...body }) => {
      const result = await client.post(base(account_id, board_id), body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_steps_get",
    {
      title: "Get Kanban Step",
      description: "[fazer.ai] Get a specific step in a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        step_id: z.number().describe("Step ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id, step_id }) => {
      const result = await client.get(
        `${base(account_id, board_id)}/${step_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_steps_update",
    {
      title: "Update Kanban Step",
      description: "[fazer.ai] Update a step in a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        step_id: z.number().describe("Step ID"),
        name: z.string().optional().describe("Step name"),
        description: z.string().optional().describe("Step description"),
        color: z.string().optional().describe("Step color (hex)"),
        cancelled: z.boolean().optional().describe("Cancelled state"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, board_id, step_id, ...body }) => {
      const result = await client.patch(
        `${base(account_id, board_id)}/${step_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_steps_delete",
    {
      title: "Delete Kanban Step",
      description: "[fazer.ai] Delete a step from a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        step_id: z.number().describe("Step ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, board_id, step_id }) => {
      await client.delete(`${base(account_id, board_id)}/${step_id}`);
      return {
        content: [{ type: "text", text: "Kanban step deleted successfully" }],
      };
    },
  );
};
