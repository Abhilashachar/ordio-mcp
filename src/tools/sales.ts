import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerSalesTools(server: McpServer, client: OrdioClient) {
  // ── Sales Data ─────────────────────────────────────────────

  server.tool(
    'list_sales_data',
    'List sales data records for the organization.',
    {
      startDate: z.string().optional().describe('ISO date string filter start'),
      endDate: z.string().optional().describe('ISO date string filter end'),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => {
      const data = await client.get('sales-data', args as Record<string, string>);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  // ── Sales Daily Summary ────────────────────────────────────

  server.tool(
    'list_sales_daily_summary',
    'List daily sales summaries for the organization. Useful for management reports.',
    {
      startDate: z.string().optional().describe('ISO date string filter start'),
      endDate: z.string().optional().describe('ISO date string filter end'),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => {
      const data = await client.get('sales-daily-summary', args as Record<string, string>);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  // ── Labor Daily Summary ────────────────────────────────────

  server.tool(
    'list_labor_daily_summary',
    'List daily labor summaries for the organization, including hours worked and labor cost.',
    {
      startDate: z.string().optional().describe('ISO date string filter start'),
      endDate: z.string().optional().describe('ISO date string filter end'),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => {
      const data = await client.get('labor-daily-summary', args as Record<string, string>);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  // ── Timesheets ─────────────────────────────────────────────

  server.tool(
    'list_timesheets',
    'List timesheet records for the organization.',
    {
      teamMemberId: z.string().optional().describe('Filter by team member ID'),
      status: z.string().optional().describe('Filter by status: "pending", "approved"'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => {
      const data = await client.get('timesheets', args as Record<string, string>);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_timesheet',
    'Get a single timesheet entry by ID.',
    { id: z.string().describe('Timesheet ID') },
    async ({ id }) => {
      const data = await client.get(`timesheets/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'create_timesheet',
    'Create a new timesheet clock-in/out entry.',
    {
      teamMemberId: z.string().min(1).describe('Team member ID'),
      clockIn: z.string().min(1).describe('ISO datetime for clock-in'),
      clockOut: z.string().optional().describe('ISO datetime for clock-out'),
      breakDuration: z.number().optional().describe('Break duration in minutes'),
      notes: z.string().optional(),
      status: z.string().optional().describe('"pending" or "approved"'),
    },
    async (args) => {
      const data = await client.post('timesheets', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'update_timesheet',
    'Update a timesheet entry (e.g. approve, add clock-out time).',
    {
      id: z.string().describe('Timesheet ID'),
      clockIn: z.string().optional(),
      clockOut: z.string().optional(),
      breakDuration: z.number().optional(),
      notes: z.string().optional(),
      status: z.string().optional().describe('"pending" or "approved"'),
    },
    async ({ id, ...body }) => {
      const data = await client.patch(`timesheets/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_timesheet',
    'Delete a timesheet entry.',
    { id: z.string().describe('Timesheet ID') },
    async ({ id }) => {
      const data = await client.delete(`timesheets/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
