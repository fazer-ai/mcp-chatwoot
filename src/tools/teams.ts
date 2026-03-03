import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/teams`;

  server.registerTool(
    "teams_list",
    {
      title: "List Teams",
      description: "List all teams in the account",
      inputSchema: { account_id: accountId },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(base(account_id));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "teams_create",
    {
      title: "Create Team",
      description: "Create a new team",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Team name"),
        description: z.string().optional().describe("Team description"),
        allow_auto_assign: z
          .boolean()
          .optional()
          .describe("Allow auto-assignment to this team"),
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
    "teams_get",
    {
      title: "Get Team",
      description: "Get a specific team",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, team_id }) => {
      const result = await client.get(`${base(account_id)}/${team_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "teams_update",
    {
      title: "Update Team",
      description: "Update a team",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
        name: z.string().optional().describe("Team name"),
        description: z.string().optional().describe("Team description"),
        allow_auto_assign: z
          .boolean()
          .optional()
          .describe("Allow auto-assignment"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, team_id, ...body }) => {
      const result = await client.patch(`${base(account_id)}/${team_id}`, body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "teams_delete",
    {
      title: "Delete Team",
      description: "Delete a team",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, team_id }) => {
      await client.delete(`${base(account_id)}/${team_id}`);
      return {
        content: [{ type: "text", text: "Team deleted successfully" }],
      };
    },
  );

  server.registerTool(
    "team_members_list",
    {
      title: "List Team Members",
      description: "List agents in a team",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, team_id }) => {
      const result = await client.get(
        `${base(account_id)}/${team_id}/team_members`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "team_members_add",
    {
      title: "Add Team Members",
      description: "Add agents to a team",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
        user_ids: z.array(z.number()).describe("Array of agent IDs to add"),
      },
    },
    async ({ account_id, team_id, user_ids }) => {
      const result = await client.post(
        `${base(account_id)}/${team_id}/team_members`,
        { user_ids },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "team_members_update",
    {
      title: "Update Team Members",
      description: "Replace all agents in a team (removes agents not in list)",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
        user_ids: z.array(z.number()).describe("Array of agent IDs"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, team_id, user_ids }) => {
      const result = await client.patch(
        `${base(account_id)}/${team_id}/team_members`,
        { user_ids },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "team_members_delete",
    {
      title: "Remove Team Members",
      description: "Remove agents from a team",
      inputSchema: {
        account_id: accountId,
        team_id: z.number().describe("Team ID"),
        user_ids: z.array(z.number()).describe("Array of agent IDs to remove"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, team_id, user_ids: _user_ids }) => {
      const result = await client.delete(
        `${base(account_id)}/${team_id}/team_members`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
