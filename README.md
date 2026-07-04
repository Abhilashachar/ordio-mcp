# Ordio MCP

**Ordio MCP — Model Context Protocol server exposing Ordio data and actions to AI assistants.**

Ordio MCP turns the [Ordio](https://getordio.com) restaurant operations platform into a set of structured tools, resources, and prompts that any AI assistant can use. Ask Claude (or any MCP-capable agent) to check inventory, draft a purchase order, schedule a shift, or run a variance report — and it can do so safely, scoped to your organization.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard for connecting AI assistants to external systems. An MCP server exposes capabilities (tools, resources, prompts) over a simple JSON-RPC interface; an MCP client (such as Claude Desktop, Claude Code, or Windsurf) connects to the server and lets the model call those capabilities on the user's behalf.

## Highlights

- ~145 tools spanning inventory, recipes, vendors, orders, invoices, tasks, team, shifts, alerts, kitchen board, AI extraction, reports, and analytics
- 5 organization resources for at-a-glance context (profile, inventory summary, active alerts, team summary, daily metrics)
- 6 prompt workflows (inventory audit, purchase-order workflow, shift scheduling, end-of-day closing, recipe costing, new menu-item setup)
- stdio and SSE transports
- Strict per-request org scoping and Bearer-token auth against the Ordio REST API
- Two tool sources, selectable at startup: the hand-written tool modules (default) or the **unified assistant catalog proxy** (`ORDIO_CATALOG_PROXY=1`), which routes every call through the Ordio API's chat/voice gateway so the MCP and in-app assistant surfaces can never drift — see [Tool source](#tool-source-hand-written-vs-catalog-proxy-ordio_catalog_proxy)

## Available tools

Tools are grouped by domain. The full list lives in [`src/tools/`](./src/tools).

| Group | Count | Examples |
|-------|-------|----------|
| Inventory | 6 | `list_inventory`, `create_inventory_item`, `batch_update_inventory` |
| Recipes | 5 | `list_recipes`, `create_recipe`, `update_recipe` |
| Recipe batches | 5 | `list_recipe_batches`, `create_recipe_batch` |
| Vendors | 5 | `list_vendors`, `create_vendor` |
| Categories | 5 | `list_categories`, `create_category` |
| Purchase orders | 5 | `list_orders`, `create_order` |
| Invoices | 5 | `list_invoices`, `create_invoice` |
| Tasks | 5 | `list_tasks`, `create_task` |
| Team | 9 | `list_team_members`, `list_departments`, `create_department` |
| Shifts | 5 | `list_shifts`, `create_shift` |
| Shift requests | 5 | `list_shift_requests`, `create_shift_request` |
| Alerts | 9 | `list_alerts`, `dismiss_alert`, `create_alert_configuration` |
| Menu items | 5 | `list_menu_items`, `create_menu_item` |
| Kitchen board | 14 | `list_kitchen_orders`, `bump_order`, `list_routing_rules` |
| Count sessions | 5 | `list_count_sessions`, `create_count_session` |
| Storage locations | 5 | `list_storage_locations`, `create_storage_location` |
| Units | 5 | `list_units`, `create_unit` |
| Sales & labor | 8 | `list_sales_data`, `list_labor_daily_summary`, `list_timesheets` |
| Activity | 3 | `list_activity`, `log_activity` |
| Settings | 4 | `get_settings`, `upsert_setting` |
| Reports | 3 | `get_variance_report`, `get_ap_aging_report`, `get_cost_analysis` |
| Temperature logs | 2 | `list_temperature_logs`, `create_temperature_log` |
| Equipment | 4 | `list_equipment`, `create_equipment` |
| AI & automation | 11 | `ai_process_invoice`, `ai_extract_recipes`, `ai_generate_recipe` |
| Search | 1 | `semantic_search` |
| Analytics | 6 | `inventory_health_dashboard`, `food_cost_analysis`, `daily_operations_briefing` |

### Resources

| URI | Description |
|-----|-------------|
| `ordio://org/profile` | Organization profile and settings |
| `ordio://org/inventory-summary` | Total items, low stock, expiring |
| `ordio://org/active-alerts` | Currently active/unresolved alerts |
| `ordio://org/team-summary` | Team count and today's schedule |
| `ordio://org/daily-metrics` | Today's alerts, tasks, inventory health |

### Prompts

`inventory-audit`, `purchase-order-workflow`, `shift-scheduling`, `end-of-day-closing`, `recipe-costing`, `new-menu-item-setup`.

## Install and configure

### Claude Code

```bash
claude mcp add ordio \
  --env ORDIO_API_KEY=sk_live_... \
  --env ORDIO_ORG_ID=org_xxxxxxxxxx \
  -- node /absolute/path/to/ordio-mcp/dist/index.js
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "ordio": {
      "command": "node",
      "args": ["/absolute/path/to/ordio-mcp/dist/index.js"],
      "env": {
        "ORDIO_API_KEY": "sk_live_...",
        "ORDIO_ORG_ID": "org_xxxxxxxxxx"
      }
    }
  }
}
```

Restart the client to pick up the new server.

### Build first

```bash
git clone https://github.com/Abhilashachar/ordio-mcp.git
cd ordio-mcp
npm install
npm run build
```

## Authentication

Every request to the Ordio REST API is sent with `Authorization: Bearer ${ORDIO_API_KEY}` and is scoped to `ORDIO_ORG_ID`. You'll need:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ORDIO_API_KEY` | yes | — | Clerk-issued API key used as the Bearer token |
| `ORDIO_ORG_ID` | yes | — | Organization ID; all tool calls are scoped to this org |
| `ORDIO_API_BASE_URL` | no | `https://api.getordio.com` | Override for staging or self-hosted deployments |
| `ORDIO_MCP_TRANSPORT` | no | `stdio` | `stdio` or `sse` |
| `ORDIO_MCP_PORT` | no | `3100` | Port for the SSE HTTP server |
| `ORDIO_CATALOG_PROXY` | no | off | Set to `1`/`true` to register tools from the API assistant catalog (proxy) instead of the hand-written tool files |

Treat your API key like a password — it grants full access to the configured organization.

## Tool source: hand-written vs. catalog proxy (`ORDIO_CATALOG_PROXY`)

The server can expose its tools from one of two sources, selected at startup by the `ORDIO_CATALOG_PROXY` flag:

- **Default (flag off):** the 27 hand-written tool modules under [`src/tools/`](./src/tools) are registered (the ~145 tools listed above). This remains the default during the transition — leaving the flag unset changes nothing.
- **Catalog proxy (`ORDIO_CATALOG_PROXY=1`):** the server fetches the ordio-api *assistant tool catalog* at startup (`GET /api/v1/orgs/:orgId/assistant/tools`) and registers one MCP tool per catalog entry, executing each through the API's chat/voice gateway (permission scoping, confirmation gating, write rate-limits, and idempotency all apply). This makes the MCP surface and the in-app chat/voice surface the **same catalog**, so they cannot drift, and a new capability added to the catalog appears here automatically. If the manifest fetch fails — or a single entry is malformed — the proxy degrades gracefully (that tool, or all tools, are skipped) rather than crashing the server.

**Why it isn't the default yet.** The two sources are mutually exclusive, and the hand-written files are retained for one more step. The assistant catalog is now a **superset of this server's non-destructive tools** — the domains that used to be MCP-only (oracle, reports, equipment, temperature logs, station/"department" writes, menu-item writes, alert lifecycle, time-clock, kitchen writes, …) are all in the catalog, so flipping the flag no longer drops them. The one deliberate difference is **destructive operations**: the assistant catalog excludes hard `delete_*` tools by policy (the assistant never destroys data — use reversible archive/restore instead), so those live only in the hand-written set. Once the proxy is validated against the live manifest in staging, a follow-up flips the default on and removes the hand-written modules.

**Prerequisites:** the API's `/assistant/tools` endpoint must be deployed (it is, on `ordio-api` `main`), and `ORDIO_API_KEY` must resolve to a user whose permissions cover the tools you want exposed — the manifest is permission-filtered per caller, and every write still passes the gateway's confirmation/rate-limit checks. (A durable service-user token minted via Clerk, rather than a hand-pasted key, is a planned follow-up.)

## Transports

- **stdio** (default): the standard MCP transport used by Claude Desktop, Claude Code, and Windsurf.
- **SSE**: an HTTP server with Server-Sent Events for remote or browser-based clients. Enable with `ORDIO_MCP_TRANSPORT=sse`.

## Local development

```bash
npm install
cp env.example .env       # fill in ORDIO_API_KEY and ORDIO_ORG_ID
npm run dev               # tsx watch — no build step
npm run typecheck         # tsc --noEmit
npm run lint              # eslint src/
npm test                  # vitest
```

Source layout:

```
src/
  index.ts          MCP server entrypoint + tool registration
  config.ts         Environment loading
  client.ts         Thin REST client (Bearer auth, org scoping)
  tools/            One module per domain (inventory, recipes, ...)
  resources/        Organization resources
  prompts/          Workflow prompts
  transports/sse.ts SSE HTTP transport
  utils/            Error and response helpers
```

## Status

Active. Version `0.2.0`. APIs and tool names may still evolve before a `1.0` release. The server is mid-migration from hand-written tool modules to the unified [catalog proxy](#tool-source-hand-written-vs-catalog-proxy-ordio_catalog_proxy); the default remains the hand-written set until the proxy is validated in staging. Issues and contributions are welcome.

## License

Released under the MIT License.
