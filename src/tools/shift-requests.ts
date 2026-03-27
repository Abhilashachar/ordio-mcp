import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerShiftRequestTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_shift_requests',
    'List shift requests, optionally filtered by status, shift, or team member',
    {
      status: z.string().optional().describe('Filter by request status'),
      shiftId: z.string().optional().describe('Filter by shift ID'),
      teamMemberId: z.string().optional().describe('Filter by team member ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('shift-requests', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'shift requests' });
    }),
  );

  server.tool(
    'get_shift_request',
    'Get a single shift request by ID',
    {
      id: z.string().describe('Shift request ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get(`shift-requests/${args.id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_shift_request',
    'Create a new shift request',
    {
      shiftId: z.string().describe('Shift ID'),
      type: z.enum(['swap', 'cover', 'drop']).describe('Request type'),
      reason: z.string().optional().describe('Reason for request'),
      coverUserId: z.string().optional().describe('Cover user ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('shift-requests', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_shift_request',
    'Update a shift request (approve or reject)',
    {
      id: z.string().describe('Shift request ID'),
      status: z.enum(['approved', 'rejected']).optional().describe('New status'),
      reviewNotes: z.string().optional().describe('Review notes'),
    },
    async (args) => withErrorHandling(async () => {
      const { id, ...body } = args;
      const data = await client.patch(`shift-requests/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_shift_request',
    'Delete a shift request',
    {
      id: z.string().describe('Shift request ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.delete(`shift-requests/${args.id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
