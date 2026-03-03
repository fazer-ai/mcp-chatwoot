import type { RegisterFn } from "@/types.ts";

export const register: RegisterFn = (server, client) => {
  server.registerTool(
    "profile_get",
    {
      title: "Get Profile",
      description: "Get the profile of the currently authenticated user/agent",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await client.get("/auth/sign_in");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
