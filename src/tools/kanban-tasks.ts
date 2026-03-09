import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number) =>
    `/api/v1/accounts/${accountId}/kanban/tasks`;

  server.registerTool(
    "kanban_tasks_list",
    {
      title: "List Kanban Tasks",
      description: "[fazer.ai] List tasks in a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().optional().describe("Filter by kanban board ID"),
        step_id: z.number().optional().describe("Filter by step ID"),
        page: z.number().optional().describe("Page number"),
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
    "kanban_tasks_create",
    {
      title: "Create Kanban Task",
      description: "[fazer.ai] Create a new task in a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        title: z.string().describe("Task title"),
        description: z.string().optional().describe("Task description"),
        board_step_id: z.number().describe("Step ID to place task in"),
        priority: z
          .enum(["none", "low", "medium", "high", "urgent"])
          .optional()
          .describe("Task priority"),
        assigned_agent_ids: z
          .array(z.number())
          .optional()
          .describe("Array of assigned agent IDs"),
        due_date: z.string().optional().describe("Due date (ISO 8601)"),
        conversation_ids: z
          .array(z.number())
          .optional()
          .describe("Array of linked conversation IDs"),
      },
    },
    async ({ account_id, ...body }) => {
      const result = await client.post(base(account_id), { task: body });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_tasks_get",
    {
      title: "Get Kanban Task",
      description: "[fazer.ai] Get a specific task",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Task ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, task_id }) => {
      const result = await client.get(`${base(account_id)}/${task_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_tasks_update",
    {
      title: "Update Kanban Task",
      description: "[fazer.ai] Update a kanban task",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Task ID"),
        title: z.string().optional().describe("Task title"),
        description: z.string().optional().describe("Task description"),
        board_step_id: z
          .number()
          .optional()
          .describe("Move to a different step"),
        priority: z
          .enum(["none", "low", "medium", "high", "urgent"])
          .optional()
          .describe("Task priority"),
        assigned_agent_ids: z
          .array(z.number())
          .nullable()
          .optional()
          .describe("Array of assigned agent IDs (null to unassign)"),
        due_date: z
          .string()
          .nullable()
          .optional()
          .describe("Due date (ISO 8601) or null to clear"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, task_id, ...body }) => {
      const result = await client.patch(`${base(account_id)}/${task_id}`, {
        task: body,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_tasks_delete",
    {
      title: "Delete Kanban Task",
      description: "[fazer.ai] Delete a kanban task",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Task ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, task_id }) => {
      await client.delete(`${base(account_id)}/${task_id}`);
      return {
        content: [{ type: "text", text: "Kanban task deleted successfully" }],
      };
    },
  );

  server.registerTool(
    "kanban_tasks_move",
    {
      title: "Move Kanban Task",
      description:
        "[fazer.ai] Move a kanban task to a different step and/or position",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Task ID"),
        board_step_id: z.number().describe("Target step ID"),
        insert_before_task_id: z
          .number()
          .optional()
          .describe("Task ID to insert before (for ordering)"),
      },
    },
    async ({ account_id, task_id, ...body }) => {
      const result = await client.post(
        `${base(account_id)}/${task_id}/move`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
