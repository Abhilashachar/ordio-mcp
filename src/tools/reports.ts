import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatItem } from '../utils/format.js';

export function registerReportTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'get_variance_report',
    'Get the inventory variance report for a date range.',
    {
      startDate: z.string().optional().describe('Start date (ISO string)'),
      endDate: z.string().optional().describe('End date (ISO string)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('reports/variance', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Variance Report');
    }),
  );

  server.tool(
    'get_ap_aging_report',
    'Get the accounts payable aging report.',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('reports/ap-aging');
      return formatItem(data, 'AP Aging Report');
    }),
  );

  server.tool(
    'get_cost_analysis',
    'Get cost analysis report for a date range.',
    {
      startDate: z.string().optional().describe('Start date (ISO string)'),
      endDate: z.string().optional().describe('End date (ISO string)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('reports/cost-analysis', args as Record<string, string | number | boolean | undefined>);
      return formatItem(data, 'Cost Analysis');
    }),
  );
}
