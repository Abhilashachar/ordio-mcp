#!/usr/bin/env node
/**
 * ordio MCP Server
 *
 * Wraps the ordio REST API as MCP tools so AI agents can interact with
 * inventory, recipes, orders, invoices, tasks, shifts, team, alerts, and more.
 *
 * Transport: stdio (default for Claude Desktop / Windsurf MCP)
 *
 * Required env vars:
 *   ORDIO_API_KEY  — Clerk API key (Bearer token)
 *   ORDIO_ORG_ID   — Organization ID to scope all calls
 *
 * Optional env vars:
 *   ORDIO_API_BASE_URL — defaults to https://api.getordio.com
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { startSSEServer } from './transports/sse.js';
import { OrdioClient } from './client.js';
import {
  registerInventoryTools,
  registerRecipeTools,
  registerVendorTools,
  registerCategoryTools,
  registerOrderTools,
  registerInvoiceTools,
  registerTaskTools,
  registerTeamTools,
  registerShiftTools,
  registerAlertTools,
  registerMenuItemTools,
  registerActivityTools,
  registerSettingsTools,
  registerSalesTools,
  registerCountSessionTools,
  registerKitchenBoardTools,
  registerRecipeBatchTools,
  registerShiftRequestTools,
  registerStorageLocationTools,
  registerUnitTools,
  registerReportTools,
  registerTemperatureLogTools,
  registerEquipmentTools,
  registerAITools,
  registerSearchTools,
  registerInsightTools,
  registerOracleTools,
} from './tools/index.js';
import { registerOrganizationResources } from './resources/index.js';
import { registerWorkflowPrompts } from './prompts/index.js';

async function main() {
  const config = loadConfig();
  const client = new OrdioClient(config);

  const server = new McpServer({
    name: 'ordio',
    version: '0.2.0',
  });

  // Register all tool groups
  registerInventoryTools(server, client);
  registerRecipeTools(server, client);
  registerVendorTools(server, client);
  registerCategoryTools(server, client);
  registerOrderTools(server, client);
  registerInvoiceTools(server, client);
  registerTaskTools(server, client);
  registerTeamTools(server, client);
  registerShiftTools(server, client);
  registerAlertTools(server, client);
  registerMenuItemTools(server, client);
  registerActivityTools(server, client);
  registerSettingsTools(server, client);
  registerSalesTools(server, client);
  registerCountSessionTools(server, client);
  registerKitchenBoardTools(server, client);
  registerRecipeBatchTools(server, client);
  registerShiftRequestTools(server, client);
  registerStorageLocationTools(server, client);
  registerUnitTools(server, client);
  registerReportTools(server, client);
  registerTemperatureLogTools(server, client);
  registerEquipmentTools(server, client);
  registerAITools(server, client);
  registerSearchTools(server, client);
  registerInsightTools(server, client);
  registerOracleTools(server, client);

  // Resources & Prompts
  registerOrganizationResources(server, client);
  registerWorkflowPrompts(server);

  if (config.transport === 'sse') {
    await startSSEServer(server, config.port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }

  process.stderr.write(`ordio MCP server started (org: ${config.orgId}, api: ${config.apiBaseUrl})\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
