import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerShiftTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_shifts',
    'List all scheduled shifts for the organization.',
    {},
    async () => {
      const data = await client.get('shifts');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_shift',
    'Get a single shift by ID.',
    { id: z.string().describe('Shift ID') },
    async ({ id }) => {
      const data = await client.get(`shifts/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
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
    async (args) => {
      const data = await client.post('shifts', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
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
    async ({ id, ...body }) => {
      const data = await client.patch(`shifts/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_shift',
    'Delete a shift by ID.',
    { id: z.string().describe('Shift ID') },
    async ({ id }) => {
      const data = await client.delete(`shifts/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
