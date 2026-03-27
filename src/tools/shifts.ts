import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerShiftTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_shifts',
    'List all scheduled shifts for the organization.',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('shifts');
      return formatList(data, { label: 'shifts' });
    }),
  );

  server.tool(
    'get_shift',
    'Get a single shift by ID.',
    { id: z.string().describe('Shift ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`shifts/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_shift',
    'Create a new shift for a team member.',
    {
      teamMemberId: z.string().min(1).describe('Team member ID'),
      departmentId: z.string().optional().describe('Department ID'),
      title: z.string().optional().describe('Shift label or role title'),
      date: z.string().min(1).describe('Shift date in YYYY-MM-DD format'),
      startTime: z.string().min(1).describe('Start time in HH:mm format'),
      endTime: z.string().min(1).describe('End time in HH:mm format'),
      status: z.string().optional().describe('"scheduled", "completed", "cancelled"'),
      type: z.string().optional().describe('"regular", "overtime", "on_call"'),
      isPublished: z.boolean().optional().describe('Whether the shift is visible to the team member'),
      notes: z.string().optional(),
      breakDuration: z.string().optional().describe('Break duration in minutes as string'),
      color: z.string().optional().describe('Hex color code'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('shifts', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_shift',
    'Update an existing shift.',
    {
      id: z.string().describe('Shift ID'),
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      status: z.string().optional(),
      isPublished: z.boolean().optional(),
      notes: z.string().optional(),
      breakDuration: z.string().optional(),
      color: z.string().optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`shifts/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_shift',
    'Delete a shift by ID.',
    { id: z.string().describe('Shift ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`shifts/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
