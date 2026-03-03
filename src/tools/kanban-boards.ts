import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/kanban_boards`;

  server.registerTool(
    "kanban_boards_list",
    {
      title: "List Kanban Boards",
      description: "[fazer.ai] List all kanban boards in the account",
      inputSchema: {
        account_id: accountId,
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
    "kanban_boards_create",
    {
      title: "Create Kanban Board",
      description: "[fazer.ai] Create a new kanban board",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Board name"),
        description: z.string().optional().describe("Board description"),
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
    "kanban_boards_get",
    {
      title: "Get Kanban Board",
      description: "[fazer.ai] Get a specific kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id }) => {
      const result = await client.get(`${base(account_id)}/${board_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_boards_update",
    {
      title: "Update Kanban Board",
      description: "[fazer.ai] Update a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        name: z.string().optional().describe("Board name"),
        description: z.string().optional().describe("Board description"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, board_id, ...body }) => {
      const result = await client.patch(
        `${base(account_id)}/${board_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_boards_delete",
    {
      title: "Delete Kanban Board",
      description: "[fazer.ai] Delete a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, board_id }) => {
      await client.delete(`${base(account_id)}/${board_id}`);
      return {
        content: [{ type: "text", text: "Kanban board deleted successfully" }],
      };
    },
  );

  server.registerTool(
    "kanban_boards_get_automation_settings",
    {
      title: "Get Board Automation",
      description: "[fazer.ai] Get automation settings for a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id }) => {
      const result = await client.get(
        `${base(account_id)}/${board_id}/automation_settings`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_boards_update_automation_settings",
    {
      title: "Update Board Automation",
      description: "[fazer.ai] Update automation settings for a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        settings: z
          .record(z.string(), z.any())
          .describe("Automation settings object"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, board_id, settings }) => {
      const result = await client.patch(
        `${base(account_id)}/${board_id}/automation_settings`,
        settings,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_boards_get_members",
    {
      title: "Get Board Members",
      description: "[fazer.ai] Get members of a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id }) => {
      const result = await client.get(
        `${base(account_id)}/${board_id}/members`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_boards_set_members",
    {
      title: "Set Board Members",
      description: "[fazer.ai] Set members of a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        user_ids: z
          .array(z.number())
          .describe("Array of user IDs to set as members"),
      },
    },
    async ({ account_id, board_id, user_ids }) => {
      const result = await client.post(
        `${base(account_id)}/${board_id}/members`,
        { user_ids },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
