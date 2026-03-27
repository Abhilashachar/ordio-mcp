import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerRecipeBatchTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_recipe_batches',
    'List recipe batches, optionally filtered by status or recipe',
    {
      status: z.string().optional().describe('Filter by batch status'),
      recipeId: z.string().optional().describe('Filter by recipe ID'),
      limit: z.number().min(1).max(1000).optional().describe('Max number of results'),
      offset: z.number().min(0).optional().describe('Offset for pagination'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('recipe-batches', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'recipe batches' });
    }),
  );

  server.tool(
    'get_recipe_batch',
    'Get a single recipe batch by ID',
    {
      id: z.string().describe('Recipe batch ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get(`recipe-batches/${args.id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_recipe_batch',
    'Create a new recipe batch',
    {
      recipeId: z.string().describe('Recipe ID'),
      multiplier: z.number().optional().describe('Batch multiplier'),
      scheduledDate: z.string().optional().describe('Scheduled date (ISO 8601)'),
      assignedTo: z.string().optional().describe('Assigned team member'),
      notes: z.string().optional().describe('Batch notes'),
      status: z.string().optional().describe('Batch status'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('recipe-batches', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_recipe_batch',
    'Update a recipe batch',
    {
      id: z.string().describe('Recipe batch ID'),
      status: z.string().optional().describe('Batch status'),
      completedAt: z.string().optional().describe('Completion timestamp (ISO 8601)'),
      notes: z.string().optional().describe('Batch notes'),
      qualityNotes: z.string().optional().describe('Quality notes'),
    },
    async (args) => withErrorHandling(async () => {
      const { id, ...body } = args;
      const data = await client.patch(`recipe-batches/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_recipe_batch',
    'Delete a recipe batch',
    {
      id: z.string().describe('Recipe batch ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.delete(`recipe-batches/${args.id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
