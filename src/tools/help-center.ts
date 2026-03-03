import { z } from "zod";
import type { RegisterFn } from "../types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const portalsBase = (id: number) => `/api/v1/accounts/${id}/portals`;

  server.registerTool(
    "help_center_portals_list",
    {
      title: "List Portals",
      description: "List all help center portals",
      inputSchema: { account_id: accountId },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id }) => {
      const result = await client.get(portalsBase(account_id));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "help_center_portals_create",
    {
      title: "Create Portal",
      description: "Create a new help center portal",
      inputSchema: {
        account_id: accountId,
        name: z.string().describe("Portal name"),
        slug: z.string().describe("URL slug for the portal"),
        color: z.string().optional().describe("Brand color"),
        homepage_link: z.string().optional().describe("Homepage link"),
        page_title: z.string().optional().describe("Page title"),
        header_text: z.string().optional().describe("Header text"),
      },
    },
    async ({ account_id, ...body }) => {
      const result = await client.post(portalsBase(account_id), body);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "help_center_portals_update",
    {
      title: "Update Portal",
      description: "Update a help center portal",
      inputSchema: {
        account_id: accountId,
        portal_id: z.number().describe("Portal ID"),
        name: z.string().optional().describe("Portal name"),
        color: z.string().optional().describe("Brand color"),
        homepage_link: z.string().optional().describe("Homepage link"),
        page_title: z.string().optional().describe("Page title"),
        header_text: z.string().optional().describe("Header text"),
      },
      annotations: { idempotentHint: true },
    },
    async ({ account_id, portal_id, ...body }) => {
      const result = await client.patch(
        `${portalsBase(account_id)}/${portal_id}`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "help_center_categories_create",
    {
      title: "Create Category",
      description: "Create a category in a help center portal",
      inputSchema: {
        account_id: accountId,
        portal_id: z.number().describe("Portal ID"),
        name: z.string().describe("Category name"),
        description: z.string().optional().describe("Category description"),
        locale: z.string().optional().describe("Locale (e.g. en)"),
        position: z.number().optional().describe("Sort position"),
      },
    },
    async ({ account_id, portal_id, ...body }) => {
      const result = await client.post(
        `${portalsBase(account_id)}/${portal_id}/categories`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "help_center_articles_create",
    {
      title: "Create Article",
      description: "Create an article in a help center portal",
      inputSchema: {
        account_id: accountId,
        portal_id: z.number().describe("Portal ID"),
        title: z.string().describe("Article title"),
        content: z.string().optional().describe("Article content (HTML)"),
        description: z
          .string()
          .optional()
          .describe("Short description / excerpt"),
        status: z
          .enum(["draft", "published", "archived"])
          .optional()
          .describe("Article status"),
        category_id: z.number().optional().describe("Category ID"),
        author_id: z.number().optional().describe("Author agent ID"),
      },
    },
    async ({ account_id, portal_id, ...body }) => {
      const result = await client.post(
        `${portalsBase(account_id)}/${portal_id}/articles`,
        body,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
