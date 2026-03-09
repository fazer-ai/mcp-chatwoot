import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/kanban/boards`;

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
    "kanban_boards_update_agents",
    {
      title: "Update Board Agents",
      description: "[fazer.ai] Update the agents assigned to a kanban board",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        agent_ids: z
          .array(z.number())
          .describe("Array of agent IDs to assign to the board"),
      },
    },
    async ({ account_id, board_id, agent_ids }) => {
      const result = await client.post(
        `${base(account_id)}/${board_id}/update_agents`,
        { agent_ids },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
