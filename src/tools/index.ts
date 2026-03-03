import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ChatwootClient } from "@/client.ts";

import { register as registerAccount } from "./account.ts";
import { register as registerAgentBots } from "./agent-bots.ts";
import { register as registerAgents } from "./agents.ts";
import { register as registerAuditLogs } from "./audit-logs.ts";
import { register as registerAutomationRules } from "./automation-rules.ts";
import { register as registerCannedResponses } from "./canned-responses.ts";
import { register as registerContactLabels } from "./contact-labels.ts";
import { register as registerContacts } from "./contacts.ts";
import { register as registerConversationAssignments } from "./conversation-assignments.ts";
import { register as registerConversations } from "./conversations.ts";
import { register as registerCustomAttributes } from "./custom-attributes.ts";
import { register as registerCustomFilters } from "./custom-filters.ts";
import { register as registerHelpCenter } from "./help-center.ts";
import { register as registerInboxes } from "./inboxes.ts";
import { register as registerIntegrations } from "./integrations.ts";
import { register as registerKanbanAuditEvents } from "./kanban-audit-events.ts";
import { register as registerKanbanBoards } from "./kanban-boards.ts";
import { register as registerKanbanPreferences } from "./kanban-preferences.ts";
import { register as registerKanbanSteps } from "./kanban-steps.ts";
import { register as registerKanbanTasks } from "./kanban-tasks.ts";
import { register as registerMessages } from "./messages.ts";
import { register as registerProfile } from "./profile.ts";
import { register as registerReports } from "./reports.ts";
import { register as registerScheduledMessages } from "./scheduled-messages.ts";
import { register as registerTeams } from "./teams.ts";
import { register as registerWebhooks } from "./webhooks.ts";

const registrations = [
  registerAccount,
  registerAgentBots,
  registerAgents,
  registerAuditLogs,
  registerAutomationRules,
  registerCannedResponses,
  registerContactLabels,
  registerContacts,
  registerConversationAssignments,
  registerConversations,
  registerCustomAttributes,
  registerCustomFilters,
  registerHelpCenter,
  registerInboxes,
  registerIntegrations,
  registerKanbanAuditEvents,
  registerKanbanBoards,
  registerKanbanPreferences,
  registerKanbanSteps,
  registerKanbanTasks,
  registerMessages,
  registerProfile,
  registerReports,
  registerScheduledMessages,
  registerTeams,
  registerWebhooks,
];

export function registerAllTools(
  server: McpServer,
  client: ChatwootClient,
): void {
  for (const register of registrations) {
    register(server, client);
  }
}
