import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerCountSessionTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_count_sessions',
    'List inventory count sessions for the organization.',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('count-sessions');
      return formatList(data, { label: 'count sessions' });
    }),
  );

  server.tool(
    'get_count_session',
    'Get a single inventory count session by ID.',
    { id: z.string().describe('Count session ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`count-sessions/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_count_session',
    'Start a new inventory count session.',
    {
      name: z.string().min(1).describe('Session name, e.g. "Weekly Count - 2025-06-01"'),
      type: z.string().optional().describe('"full" or "partial"'),
      notes: z.string().optional(),
      scheduledDate: z.string().optional().describe('ISO datetime for scheduled count'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('count-sessions', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_count_session',
    'Update a count session (e.g. mark it complete).',
    {
      id: z.string().describe('Count session ID'),
      status: z.string().optional().describe('"in_progress", "completed", "cancelled"'),
      notes: z.string().optional(),
      completedAt: z.string().optional().describe('ISO datetime when count was completed'),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`count-sessions/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_count_session',
    'Delete an inventory count session.',
    { id: z.string().describe('Count session ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`count-sessions/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
