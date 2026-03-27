import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerActivityTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_activity',
    'List the activity log for the organization. Shows recent actions like inventory updates, task completions, etc.',
    {
      type: z.string().optional().describe('Filter by activity type, e.g. "inventory_update", "task_completed"'),
      limit: z.number().min(1).max(500).optional().describe('Max records to return'),
      offset: z.number().min(0).optional().describe('Pagination offset'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('activity', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'activity records' });
    }),
  );

  server.tool(
    'get_activity_record',
    'Get a single activity log entry by ID.',
    { id: z.string().describe('Activity record ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`activity/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'log_activity',
    'Write a new activity log entry. Use this to record agent-initiated actions.',
    {
      type: z.string().min(1).describe('Activity type, e.g. "agent_action"'),
      subtype: z.string().optional().describe('Sub-category of the activity type'),
      collection: z.string().optional().describe('Resource collection name, e.g. "inventory"'),
      documentId: z.string().optional().describe('ID of the affected resource'),
      userName: z.string().optional().describe('Name of the user or agent that performed the action'),
      status: z.string().optional().describe('"success" or "error"'),
      details: z.record(z.unknown()).optional().describe('Arbitrary details about the action'),
      notes: z.string().optional(),
      reason: z.string().optional().describe('Reason for the action'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('activity', args);
      return formatMutation(data, 'Created');
    }),
  );
}
