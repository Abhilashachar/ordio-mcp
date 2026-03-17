import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerMenuItemTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_menu_items',
    'List all menu items for the organization.',
    {},
    async () => {
      const data = await client.get('menu-items');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_menu_item',
    'Get a single menu item by ID.',
    { id: z.string().describe('Menu item ID') },
    async ({ id }) => {
      const data = await client.get(`menu-items/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'create_menu_item',
    'Create a new menu item.',
    {
      name: z.string().min(1).describe('Menu item name'),
      description: z.string().optional(),
      categoryId: z.string().optional().describe('Category ID'),
      recipeId: z.string().optional().describe('Linked recipe ID'),
      price: z.string().optional().describe('Selling price as string'),
      cost: z.string().optional().describe('Cost to make as string'),
      isActive: z.boolean().optional().describe('Whether the item is active on the menu'),
      isAvailable: z.boolean().optional().describe('Whether the item is currently available'),
      imageUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (args) => {
      const data = await client.post('menu-items', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'update_menu_item',
    'Update an existing menu item.',
    {
      id: z.string().describe('Menu item ID'),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      cost: z.string().optional(),
      isActive: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
      imageUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ id, ...body }) => {
      const data = await client.patch(`menu-items/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_menu_item',
    'Delete a menu item by ID.',
    { id: z.string().describe('Menu item ID') },
    async ({ id }) => {
      const data = await client.delete(`menu-items/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
