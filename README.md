# @fazer-ai/mcp-chatwoot

[![npm version](https://img.shields.io/npm/v/@fazer-ai/mcp-chatwoot.svg)](https://www.npmjs.com/package/@fazer-ai/mcp-chatwoot)
[![npm downloads](https://img.shields.io/npm/dm/@fazer-ai/mcp-chatwoot.svg)](https://www.npmjs.com/package/@fazer-ai/mcp-chatwoot)

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that exposes the full [Chatwoot](https://www.chatwoot.com/) API — including [fazer.ai](https://fazer.ai) exclusive features — as **129 tools** for use with AI assistants like Claude, VS Code Copilot, and others.

## Features

- **129 tools** covering all Chatwoot API endpoints
- Account, Agents, Contacts, Conversations, Messages, Inboxes, Teams, and more
- Reports (v1 & v2), Help Center, Automation Rules, Custom Attributes, Custom Filters
- **[fazer.ai] exclusive**: Kanban Boards, Kanban Steps, Kanban Tasks, Kanban Audit Events, Kanban Preferences, Scheduled Messages
- Proper MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`)
- Multi-account support (`account_id` is a per-tool argument)
- stdio transport (compatible with Claude Desktop, VS Code, and any MCP client)

## Requirements

- [Bun](https://bun.sh/) v1.0+
- A Chatwoot instance with API access

## Installation

```bash
bun install
```

## Environment Variables

| Variable             | Required | Description                                                   |
| -------------------- | -------- | ------------------------------------------------------------- |
| `CHATWOOT_BASE_URL`  | Yes      | Your Chatwoot instance URL (e.g. `https://app.chatwoot.com`)  |
| `CHATWOOT_API_TOKEN` | Yes      | API access token (found in Chatwoot → Profile → Access Token) |

## Usage

### Development

```bash
bun run dev
```

### Production

```bash
bun run start
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "chatwoot": {
      "command": "bun",
      "args": ["run", "/path/to/mcp-chatwoot/src/index.ts"],
      "env": {
        "CHATWOOT_BASE_URL": "https://your-chatwoot-instance.com",
        "CHATWOOT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### VS Code Configuration

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "chatwoot": {
      "command": "bun",
      "args": ["run", "${workspaceFolder}/src/index.ts"],
      "env": {
        "CHATWOOT_BASE_URL": "https://your-chatwoot-instance.com",
        "CHATWOOT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Available Tools (129)

### Account (2)

`account_get`, `account_update`

### Agent Bots (5)

`agent_bots_list`, `agent_bots_create`, `agent_bots_get`, `agent_bots_update`, `agent_bots_delete`

### Agents (4)

`agents_list`, `agents_create`, `agents_update`, `agents_delete`

### Audit Logs (1)

`audit_logs_list`

### Automation Rules (5)

`automation_rules_list`, `automation_rules_create`, `automation_rules_get`, `automation_rules_update`, `automation_rules_delete`

### Canned Responses (4)

`canned_responses_list`, `canned_responses_create`, `canned_responses_update`, `canned_responses_delete`

### Contacts (11)

`contacts_list`, `contacts_create`, `contacts_get`, `contacts_update`, `contacts_delete`, `contacts_conversations`, `contacts_search`, `contacts_filter`, `contacts_create_contact_inbox`, `contacts_contactable_inboxes`, `contacts_merge`

### Contact Labels (2)

`contact_labels_list`, `contact_labels_set`

### Conversations (12)

`conversations_meta`, `conversations_list`, `conversations_create`, `conversations_filter`, `conversations_get`, `conversations_update`, `conversations_toggle_status`, `conversations_toggle_priority`, `conversations_set_custom_attributes`, `conversations_get_labels`, `conversations_set_labels`, `conversations_reporting_events`

### Conversation Assignments (1)

`conversation_assignments_assign`

### Messages (3)

`messages_list`, `messages_create`, `messages_delete`

### Custom Attributes (5)

`custom_attributes_list`, `custom_attributes_create`, `custom_attributes_get`, `custom_attributes_update`, `custom_attributes_delete`

### Custom Filters (5)

`custom_filters_list`, `custom_filters_create`, `custom_filters_get`, `custom_filters_update`, `custom_filters_delete`

### Help Center (5)

`help_center_portals_list`, `help_center_portals_create`, `help_center_portals_update`, `help_center_categories_create`, `help_center_articles_create`

### Inboxes (11)

`inboxes_list`, `inboxes_get`, `inboxes_create`, `inboxes_update`, `inboxes_get_agent_bot`, `inboxes_set_agent_bot`, `inbox_members_list`, `inbox_members_create`, `inbox_members_update`, `inbox_members_delete`

### Integrations (4)

`integrations_list_apps`, `integrations_create_hook`, `integrations_update_hook`, `integrations_delete_hook`

### Profile (1)

`profile_get`

### Reports (9)

`reports_account_overview`, `reports_account_summary`, `reports_agent_summary`, `reports_conversation_metrics`, `reports_v2_overview`, `reports_v2_agents`, `reports_v2_inboxes`, `reports_v2_teams`, `reports_v2_labels`

### Teams (9)

`teams_list`, `teams_create`, `teams_get`, `teams_update`, `teams_delete`, `team_members_list`, `team_members_add`, `team_members_update`, `team_members_delete`

### Webhooks (4)

`webhooks_list`, `webhooks_create`, `webhooks_update`, `webhooks_delete`

### Kanban Boards (9) — [fazer.ai]

`kanban_boards_list`, `kanban_boards_create`, `kanban_boards_get`, `kanban_boards_update`, `kanban_boards_delete`, `kanban_boards_get_automation_settings`, `kanban_boards_update_automation_settings`, `kanban_boards_get_members`, `kanban_boards_set_members`

### Kanban Steps (5) — [fazer.ai]

`kanban_steps_list`, `kanban_steps_create`, `kanban_steps_get`, `kanban_steps_update`, `kanban_steps_delete`

### Kanban Tasks (7) — [fazer.ai]

`kanban_tasks_list`, `kanban_tasks_create`, `kanban_tasks_get`, `kanban_tasks_update`, `kanban_tasks_delete`, `kanban_tasks_move`

### Kanban Audit Events (2) — [fazer.ai]

`kanban_audit_events_list`, `kanban_audit_events_get`

### Kanban Preferences (1) — [fazer.ai]

`kanban_preferences_get`

### Scheduled Messages (4) — [fazer.ai]

`scheduled_messages_list`, `scheduled_messages_create`, `scheduled_messages_update`, `scheduled_messages_delete`

## Development

```bash
# Run tests
bun test

# Lint & format
bun run lint
bun run format

# Type check
bun run build-check

# Full check (lint + type-check + tests)
bun run check
```

## License

MIT
