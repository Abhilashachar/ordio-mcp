# ordio MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that wraps the [ordio](https://getordio.com) REST API, enabling AI agents to interact with ordio data as structured tools.

## Overview

The ordio MCP server exposes 65+ tools across 15 resource groups, allowing agents to read and write ordio data — inventory, recipes, vendors, orders, invoices, tasks, shifts, team members, alerts, and more.

**Transport:** stdio (compatible with Claude Desktop, Windsurf, and any MCP-capable agent framework)

## Prerequisites

- Node.js 20+
- An ordio account at [getordio.com](https://getordio.com)
- A Clerk API key for your ordio org
- Your ordio organization ID

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

```env
ORDIO_API_KEY=sk_live_...     # Clerk secret key — used as Bearer token
ORDIO_ORG_ID=org_...          # Your ordio organization ID
# ORDIO_API_BASE_URL=https://api.getordio.com  # optional override
```

### 3. Build

```bash
npm run build
```

### 4. Run

```bash
npm start
```

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

## Available Tools

### Inventory
| Tool | Description |
|------|-------------|
| `list_inventory` | List all inventory items |
| `get_inventory_item` | Get a single item by ID |
| `create_inventory_item` | Create a new inventory item |
| `update_inventory_item` | Update an existing item |
| `delete_inventory_item` | Delete an item |

### Recipes
| Tool | Description |
|------|-------------|
| `list_recipes` | List all recipes |
| `get_recipe` | Get a single recipe by ID |
| `create_recipe` | Create a new recipe |
| `update_recipe` | Update an existing recipe |
| `delete_recipe` | Delete a recipe |

### Vendors
| Tool | Description |
|------|-------------|
| `list_vendors` | List all vendors |
| `get_vendor` | Get a single vendor by ID |
| `create_vendor` | Create a new vendor |
| `update_vendor` | Update an existing vendor |
| `delete_vendor` | Delete a vendor |

### Categories
| Tool | Description |
|------|-------------|
| `list_categories` | List all categories |
| `get_category` | Get a single category by ID |
| `create_category` | Create a new category |
| `update_category` | Update a category |
| `delete_category` | Delete a category |

### Purchase Orders
| Tool | Description |
|------|-------------|
| `list_orders` | List all purchase orders |
| `get_order` | Get a single order by ID |
| `create_order` | Create a new order |
| `update_order` | Update an order |
| `delete_order` | Delete an order |

### Invoices
| Tool | Description |
|------|-------------|
| `list_invoices` | List all invoices |
| `get_invoice` | Get a single invoice by ID |
| `create_invoice` | Create a new invoice |
| `update_invoice` | Update an invoice |
| `delete_invoice` | Delete an invoice |

### Tasks
| Tool | Description |
|------|-------------|
| `list_tasks` | List all tasks |
| `get_task` | Get a single task by ID |
| `create_task` | Create a new task |
| `update_task` | Update a task (reassign, change status, etc.) |
| `delete_task` | Delete a task |

### Team
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

### Shifts
| Tool | Description |
|------|-------------|
| `list_shifts` | List all shifts |
| `get_shift` | Get a single shift by ID |
| `create_shift` | Schedule a new shift |
| `update_shift` | Update a shift |
| `delete_shift` | Delete a shift |

### Alerts
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

### Menu Items
| Tool | Description |
|------|-------------|
| `list_menu_items` | List all menu items |
| `get_menu_item` | Get a single menu item |
| `create_menu_item` | Create a new menu item |
| `update_menu_item` | Update a menu item |
| `delete_menu_item` | Delete a menu item |

### Activity Log
| Tool | Description |
|------|-------------|
| `list_activity` | List the org activity log |
| `get_activity_record` | Get a single activity entry |
| `log_activity` | Write a new activity log entry |

### Settings
| Tool | Description |
|------|-------------|
| `get_settings` | Get all org settings |
| `get_setting` | Get a single setting by key |
| `upsert_setting` | Create or update a setting |
| `delete_setting` | Delete a setting |

### Sales & Labor
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

### Inventory Count Sessions
| Tool | Description |
|------|-------------|
| `list_count_sessions` | List inventory count sessions |
| `get_count_session` | Get a single count session |
| `create_count_session` | Start a new count session |
| `update_count_session` | Update a count session |
| `delete_count_session` | Delete a count session |

## Project Structure

```
ordio-mcp/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── config.ts         # Environment variable loading
│   ├── client.ts         # HTTP client for ordio API
│   └── tools/
│       ├── index.ts      # Tool registration barrel
│       ├── inventory.ts
│       ├── recipes.ts
│       ├── vendors.ts
│       ├── categories.ts
│       ├── orders.ts
│       ├── invoices.ts
│       ├── tasks.ts
│       ├── team.ts
│       ├── shifts.ts
│       ├── alerts.ts
│       ├── menu-items.ts
│       ├── activity.ts
│       ├── settings.ts
│       ├── sales.ts
│       └── count-sessions.ts
├── env.example
├── package.json
└── tsconfig.json
```

## Development

```bash
npm run dev    # Run with ts-node (no build step)
npm run build  # Compile TypeScript to dist/
npm start      # Run compiled output
```

## API

All tools communicate with the ordio REST API at `https://api.getordio.com`. Every request is automatically scoped to your org (`ORDIO_ORG_ID`) and authenticated with your API key (`ORDIO_API_KEY`) as a Bearer token.
