import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerCountSessionTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_count_sessions',
    'List inventory count sessions for the organization.',
    {},
    async () => {
      const data = await client.get('count-sessions');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_count_session',
    'Get a single inventory count session by ID.',
    { id: z.string().describe('Count session ID') },
    async ({ id }) => {
      const data = await client.get(`count-sessions/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
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
    async (args) => {
      const data = await client.post('count-sessions', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
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
    async ({ id, ...body }) => {
      const data = await client.patch(`count-sessions/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_count_session',
    'Delete an inventory count session.',
    { id: z.string().describe('Count session ID') },
    async ({ id }) => {
      const data = await client.delete(`count-sessions/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
