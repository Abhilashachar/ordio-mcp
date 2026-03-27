import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatItem } from '../utils/format.js';

export function registerInsightTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'inventory_health_dashboard',
    'Get a comprehensive inventory health overview: low stock, expiring, overstocked, and out-of-stock items with summary counts.',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('analytics/inventory-health');
      return formatItem(data, 'Inventory health');
    }),
  );

  server.tool(
    'recipe_feasibility_check',
    'Check if a recipe can be prepared with current inventory. Returns go/no-go with details on which ingredients are short.',
    {
      recipeId: z.string().describe('Recipe ID to check'),
      multiplier: z.number().min(0.1).optional().describe('Batch multiplier (default 1)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('analytics/recipe-feasibility', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Recipe feasibility');
    }),
  );

  server.tool(
    'vendor_spend_summary',
    'Analyze vendor spending over a date range. Shows spend per vendor, invoice counts, and averages.',
    {
      startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('analytics/vendor-spend', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Vendor spend');
    }),
  );

  server.tool(
    'shift_coverage_analysis',
    'Analyze shift coverage for a specific date. Identifies gaps and overstaffing.',
    {
      date: z.string().describe('Date to analyze (YYYY-MM-DD)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('analytics/shift-coverage', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Shift coverage');
    }),
  );

  server.tool(
    'daily_operations_briefing',
    'Get a daily operations briefing: alerts, tasks, inventory health, shift coverage, and a summary.',
    {
      date: z.string().optional().describe('Date (YYYY-MM-DD), defaults to today'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('analytics/daily-briefing', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Daily briefing');
    }),
  );

  server.tool(
    'food_cost_analysis',
    'Calculate food cost percentage for recipes. Flags recipes above 35% food cost.',
    {
      recipeId: z.string().optional().describe('Specific recipe ID, or omit for all active recipes'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('analytics/food-cost', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Food cost analysis');
    }),
  );
}
