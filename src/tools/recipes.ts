import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerRecipeTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_recipes',
    'List all recipes for the organization. Supports filtering by status, recipe type, and search.',
    {
      status: z.string().optional().describe('Filter by status, e.g. "active"'),
      recipeType: z.string().optional().describe('Filter by recipe type'),
      search: z.string().optional().describe('Free-text search'),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('recipes', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'recipes' });
    }),
  );

  server.tool(
    'get_recipe',
    'Get a single recipe by ID.',
    { id: z.string().describe('Recipe ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`recipes/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_recipe',
    'Create a new recipe with ingredients and instructions.',
    {
      name: z.string().min(1).describe('Recipe name'),
      description: z.string().optional(),
      ingredients: z.array(z.object({
        itemId: z.string().describe('Inventory item ID'),
        quantity: z.number().describe('Quantity required'),
        unit: z.string().describe('Unit of measure'),
      })).optional().describe('List of ingredients'),
      instructions: z.array(z.string()).optional().describe('Step-by-step instructions'),
      yield: z.number().optional().describe('Yield amount'),
      yieldUnit: z.string().optional().describe('Unit for the yield'),
      preparationTime: z.number().optional().describe('Prep time in minutes'),
      cookingTime: z.number().optional().describe('Cook time in minutes'),
      notes: z.string().optional(),
      cost: z.number().optional().describe('Total recipe cost'),
      price: z.number().optional().describe('Selling price'),
      status: z.string().optional(),
      recipeType: z.string().optional().describe('Recipe category type'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('recipes', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_recipe',
    'Update an existing recipe. Only include fields to change.',
    {
      id: z.string().describe('Recipe ID'),
      name: z.string().optional(),
      description: z.string().optional(),
      ingredients: z.array(z.object({
        itemId: z.string(),
        quantity: z.number(),
        unit: z.string(),
      })).optional(),
      instructions: z.array(z.string()).optional(),
      yield: z.number().optional(),
      yieldUnit: z.string().optional(),
      preparationTime: z.number().optional(),
      cookingTime: z.number().optional(),
      notes: z.string().optional(),
      cost: z.number().optional(),
      price: z.number().optional(),
      status: z.string().optional(),
      recipeType: z.string().optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`recipes/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_recipe',
    'Delete a recipe by ID.',
    { id: z.string().describe('Recipe ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`recipes/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
