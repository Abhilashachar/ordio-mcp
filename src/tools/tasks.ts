import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerTaskTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_tasks',
    'List all tasks for the organization. Supports filtering by status, assignee, week/year.',
    {
      status: z.string().optional().describe('Filter by status: "todo", "in_progress", "done"'),
      assigneeId: z.string().optional().describe('Filter by assigned team member ID'),
      week: z.number().optional().describe('ISO week number'),
      year: z.number().optional().describe('Year, e.g. 2025'),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('tasks', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'tasks' });
    }),
  );

  server.tool(
    'get_task',
    'Get a single task by ID.',
    { id: z.string().describe('Task ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`tasks/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_task',
    'Create a new task.',
    {
      title: z.string().min(1).describe('Task title'),
      description: z.string().optional(),
      status: z.string().optional().describe('"todo", "in_progress", or "done"'),
      priority: z.string().optional().describe('"low", "medium", or "high"'),
      assigneeId: z.string().optional().describe('Team member ID to assign the task to'),
      assigneeName: z.string().optional(),
      dueDate: z.string().optional().describe('ISO datetime string'),
      week: z.number().optional().describe('ISO week number this task belongs to'),
      year: z.number().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isRecurring: z.boolean().optional(),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('tasks', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_task',
    'Update an existing task. Use this to change status, reassign, or mark complete.',
    {
      id: z.string().describe('Task ID'),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional().describe('"todo", "in_progress", or "done"'),
      priority: z.string().optional(),
      assigneeId: z.string().optional(),
      assigneeName: z.string().optional(),
      dueDate: z.string().optional(),
      completedAt: z.string().optional().describe('ISO datetime when task was completed'),
      completedBy: z.string().optional().describe('User ID who completed it'),
      completionNotes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`tasks/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_task',
    'Delete a task by ID.',
    { id: z.string().describe('Task ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`tasks/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
