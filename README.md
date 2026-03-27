# ordio MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that wraps the [ordio](https://getordio.com) REST API, enabling AI agents to interact with ordio data as structured tools.

## Overview

The ordio MCP server exposes ~145 tools across 27 categories, 5 resources, and 6 prompts. It supports both stdio and SSE transports, making it compatible with Claude Desktop, Windsurf, and any MCP-capable agent framework.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ORDIO_API_KEY` | Yes | -- | Clerk secret key (used as Bearer token) |
| `ORDIO_ORG_ID` | Yes | -- | Your ordio organization ID |
| `ORDIO_API_BASE_URL` | No | `https://api.getordio.com` | API base URL override |
| `ORDIO_MCP_TRANSPORT` | No | `stdio` | Transport mode: `stdio` or `sse` |
| `ORDIO_MCP_PORT` | No | `3100` | Port for SSE HTTP server |

### 3. Build and run

```bash
npm run build
npm start
```

## Tool Reference

### Inventory (6 tools)

| Tool | Description |
|------|-------------|
| `list_inventory` | List all inventory items |
| `get_inventory_item` | Get a single item by ID |
| `create_inventory_item` | Create a new inventory item |
| `update_inventory_item` | Update an existing item |
| `delete_inventory_item` | Delete an item |
| `batch_update_inventory` | Batch update multiple items |

### Recipes (5 tools)

| Tool | Description |
|------|-------------|
| `list_recipes` | List all recipes |
| `get_recipe` | Get a single recipe by ID |
| `create_recipe` | Create a new recipe |
| `update_recipe` | Update an existing recipe |
| `delete_recipe` | Delete a recipe |

### Vendors (5 tools)

| Tool | Description |
|------|-------------|
| `list_vendors` | List all vendors |
| `get_vendor` | Get a single vendor by ID |
| `create_vendor` | Create a new vendor |
| `update_vendor` | Update an existing vendor |
| `delete_vendor` | Delete a vendor |

### Categories (5 tools)

| Tool | Description |
|------|-------------|
| `list_categories` | List all categories |
| `get_category` | Get a single category by ID |
| `create_category` | Create a new category |
| `update_category` | Update a category |
| `delete_category` | Delete a category |

### Purchase Orders (5 tools)

| Tool | Description |
|------|-------------|
| `list_orders` | List all purchase orders |
| `get_order` | Get a single order by ID |
| `create_order` | Create a new order |
| `update_order` | Update an order |
| `delete_order` | Delete an order |

### Invoices (5 tools)

| Tool | Description |
|------|-------------|
| `list_invoices` | List all invoices |
| `get_invoice` | Get a single invoice by ID |
| `create_invoice` | Create a new invoice |
| `update_invoice` | Update an invoice |
| `delete_invoice` | Delete an invoice |

### Tasks (5 tools)

| Tool | Description |
|------|-------------|
| `list_tasks` | List all tasks |
| `get_task` | Get a single task by ID |
| `create_task` | Create a new task |
| `update_task` | Update a task |
| `delete_task` | Delete a task |

### Team (9 tools)

| Tool | Description |
|------|-------------|
| `list_team_members` | List all team members |
| `get_team_member` | Get a single team member |
| `create_team_member` | Add a new team member |
| `update_team_member` | Update a team member |
| `delete_team_member` | Remove a team member |
| `list_departments` | List all departments |
| `create_department` | Create a department |
| `update_department` | Update a department |
| `delete_department` | Delete a department |

### Shifts (5 tools)

| Tool | Description |
|------|-------------|
| `list_shifts` | List all shifts |
| `get_shift` | Get a single shift by ID |
| `create_shift` | Schedule a new shift |
| `update_shift` | Update a shift |
| `delete_shift` | Delete a shift |

### Shift Requests (5 tools)

| Tool | Description |
|------|-------------|
| `list_shift_requests` | List all shift requests |
| `get_shift_request` | Get a single shift request |
| `create_shift_request` | Create a shift request |
| `update_shift_request` | Update a shift request |
| `delete_shift_request` | Delete a shift request |

### Alerts (9 tools)

| Tool | Description |
|------|-------------|
| `list_alerts` | List all active alerts |
| `get_alert` | Get a single alert |
| `mark_alert_read` | Mark an alert as read |
| `dismiss_alert` | Dismiss an alert |
| `delete_alert` | Delete an alert |
| `list_alert_configurations` | List alert rule configurations |
| `create_alert_configuration` | Create an alert rule |
| `update_alert_configuration` | Update an alert rule |
| `delete_alert_configuration` | Delete an alert rule |

### Menu Items (5 tools)

| Tool | Description |
|------|-------------|
| `list_menu_items` | List all menu items |
| `get_menu_item` | Get a single menu item |
| `create_menu_item` | Create a new menu item |
| `update_menu_item` | Update a menu item |
| `delete_menu_item` | Delete a menu item |

### Activity (3 tools)

| Tool | Description |
|------|-------------|
| `list_activity` | List the org activity log |
| `get_activity_record` | Get a single activity entry |
| `log_activity` | Write a new activity log entry |

### Settings (4 tools)

| Tool | Description |
|------|-------------|
| `get_settings` | Get all org settings |
| `get_setting` | Get a single setting by key |
| `upsert_setting` | Create or update a setting |
| `delete_setting` | Delete a setting |

### Sales & Labor (8 tools)

| Tool | Description |
|------|-------------|
| `list_sales_data` | List sales data records |
| `list_sales_daily_summary` | Daily sales summaries |
| `list_labor_daily_summary` | Daily labor summaries |
| `list_timesheets` | List timesheet entries |
| `get_timesheet` | Get a single timesheet |
| `create_timesheet` | Create a timesheet entry |
| `update_timesheet` | Update a timesheet entry |
| `delete_timesheet` | Delete a timesheet entry |

### Count Sessions (5 tools)

| Tool | Description |
|------|-------------|
| `list_count_sessions` | List inventory count sessions |
| `get_count_session` | Get a single count session |
| `create_count_session` | Start a new count session |
| `update_count_session` | Update a count session |
| `delete_count_session` | Delete a count session |

### Kitchen Board (14 tools)

| Tool | Description |
|------|-------------|
| `list_kitchen_orders` | List kitchen orders |
| `get_kitchen_order` | Get a single kitchen order |
| `create_kitchen_order` | Create a kitchen order |
| `update_kitchen_order` | Update a kitchen order |
| `delete_kitchen_order` | Delete a kitchen order |
| `list_kitchen_stations` | List kitchen stations |
| `create_kitchen_station` | Create a kitchen station |
| `update_kitchen_station` | Update a kitchen station |
| `delete_kitchen_station` | Delete a kitchen station |
| `list_station_groups` | List station groups |
| `list_routing_rules` | List routing rules |
| `create_routing_rule` | Create a routing rule |
| `list_bumped_orders` | List bumped orders |
| `bump_order` | Bump an order |

### Recipe Batches (5 tools)

| Tool | Description |
|------|-------------|
| `list_recipe_batches` | List recipe batches |
| `get_recipe_batch` | Get a single recipe batch |
| `create_recipe_batch` | Create a recipe batch |
| `update_recipe_batch` | Update a recipe batch |
| `delete_recipe_batch` | Delete a recipe batch |

### Storage Locations (5 tools)

| Tool | Description |
|------|-------------|
| `list_storage_locations` | List storage locations |
| `get_storage_location` | Get a single storage location |
| `create_storage_location` | Create a storage location |
| `update_storage_location` | Update a storage location |
| `delete_storage_location` | Delete a storage location |

### Units (5 tools)

| Tool | Description |
|------|-------------|
| `list_units` | List all units |
| `get_unit` | Get a single unit |
| `create_unit` | Create a unit |
| `update_unit` | Update a unit |
| `delete_unit` | Delete a unit |

### Reports (3 tools)

| Tool | Description |
|------|-------------|
| `get_variance_report` | Generate a variance report |
| `get_ap_aging_report` | Generate an AP aging report |
| `get_cost_analysis` | Generate a cost analysis report |

### Temperature Logs (2 tools)

| Tool | Description |
|------|-------------|
| `list_temperature_logs` | List temperature logs |
| `create_temperature_log` | Create a temperature log entry |

### Equipment (4 tools)

| Tool | Description |
|------|-------------|
| `list_equipment` | List all equipment |
| `get_equipment` | Get a single equipment item |
| `create_equipment` | Create an equipment record |
| `update_equipment` | Update an equipment record |

### AI & Automation (11 tools)

| Tool | Description |
|------|-------------|
| `ai_process_invoice` | Process an invoice with AI extraction |
| `ai_extract_totals` | Extract totals from a document |
| `ai_unit_conversion` | Convert between units with AI |
| `ai_extract_recipes` | Extract recipes from text |
| `ai_extract_recipe_image` | Extract a recipe from an image |
| `ai_extract_inventory` | Extract inventory data from a document |
| `ai_extract_document` | Extract structured data from a document |
| `ai_parse_unit` | Parse a unit string into structured data |
| `ai_generate_recipe` | Generate a recipe with AI |
| `ai_batch_generate_recipes` | Batch generate multiple recipes |
| `ai_generate_quantities` | Generate suggested quantities |

### Search (1 tool)

| Tool | Description |
|------|-------------|
| `semantic_search` | Semantic search across all org data |

### Analytics (6 tools)

| Tool | Description |
|------|-------------|
| `inventory_health_dashboard` | Inventory health overview with low stock and expiring items |
| `recipe_feasibility_check` | Check if a recipe can be made with current inventory |
| `vendor_spend_summary` | Vendor spend breakdown over a date range |
| `shift_coverage_analysis` | Analyze shift coverage gaps |
| `daily_operations_briefing` | Daily operations summary |
| `food_cost_analysis` | Analyze food cost percentages |

## Resources

| Resource URI | Description |
|-------------|-------------|
| `ordio://org/profile` | Organization profile and settings |
| `ordio://org/inventory-summary` | Inventory summary (total items, low stock, expiring) |
| `ordio://org/active-alerts` | Currently active/unresolved alerts |
| `ordio://org/team-summary` | Team member count and today's shift schedule |
| `ordio://org/daily-metrics` | Today's key metrics (alerts, tasks, inventory health) |

## Prompts

| Prompt | Description |
|--------|-------------|
| `inventory-audit` | Step-by-step inventory audit with anomaly detection and reorder suggestions |
| `purchase-order-workflow` | Generate a purchase order based on current inventory needs |
| `shift-scheduling` | Create an optimized shift schedule for a given week |
| `end-of-day-closing` | End-of-day closing checklist for restaurant operations |
| `recipe-costing` | Analyze and optimize food costs for recipes |
| `new-menu-item-setup` | Complete setup workflow for adding a new menu item |

## Transport Options

### stdio (default)

Standard I/O transport for direct integration with MCP clients like Claude Desktop and Windsurf. No additional configuration needed.

### SSE (Server-Sent Events)

HTTP-based transport for web clients and remote connections. Enable by setting:

```env
ORDIO_MCP_TRANSPORT=sse
ORDIO_MCP_PORT=3100
```

The server will start an HTTP server on the configured port with SSE endpoints for MCP communication.

## MCP Client Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ordio": {
      "command": "node",
      "args": ["/absolute/path/to/ordio-mcp/dist/index.js"],
      "env": {
        "ORDIO_API_KEY": "sk_live_...",
        "ORDIO_ORG_ID": "org_..."
      }
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP settings:

```json
{
  "mcpServers": {
    "ordio": {
      "command": "node",
      "args": ["/absolute/path/to/ordio-mcp/dist/index.js"],
      "env": {
        "ORDIO_API_KEY": "sk_live_...",
        "ORDIO_ORG_ID": "org_..."
      }
    }
  }
}
```

## Development

```bash
npm run dev        # Run with tsx watch (no build step)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled output
npm run typecheck  # Type-check without emitting
npm run lint       # Lint source files
```

## Testing

Tests use [Vitest](https://vitest.dev/) and cover utility functions (error handling, response formatting) and tool patterns.

```bash
npm test           # Run all tests
npx vitest         # Run in watch mode
npx vitest run --reporter=verbose  # Verbose output
```

## API

All tools communicate with the ordio REST API at `https://api.getordio.com`. Every request is automatically scoped to your org (`ORDIO_ORG_ID`) and authenticated with your API key (`ORDIO_API_KEY`) as a Bearer token.
