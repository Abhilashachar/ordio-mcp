import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerCategoryTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_categories',
    'List all inventory categories for the organization.',
    {
      status: z.string().optional().describe('Filter by status, e.g. "active"'),
      search: z.string().optional().describe('Free-text search'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('categories', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'categories' });
    }),
  );

  server.tool(
    'get_category',
    'Get a single category by ID.',
    { id: z.string().describe('Category ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`categories/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_category',
    'Create a new inventory category.',
    {
      name: z.string().min(1).describe('Category name'),
      description: z.string().optional(),
      color: z.string().optional().describe('Hex color code, e.g. "#FF5733"'),
      status: z.string().optional().describe('"active" or "inactive"'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('categories', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_category',
    'Update an existing category.',
    {
      id: z.string().describe('Category ID'),
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      status: z.string().optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`categories/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_category',
    'Delete a category by ID.',
    { id: z.string().describe('Category ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`categories/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
