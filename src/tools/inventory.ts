import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerInventoryTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_inventory',
    'List all inventory items for the organization. Supports filtering by status, category, vendor and free-text search.',
    {
      status: z.string().optional().describe('Filter by status, e.g. "active" or "inactive"'),
      category: z.string().optional().describe('Filter by category name'),
      vendorId: z.string().optional().describe('Filter by vendor ID'),
      search: z.string().optional().describe('Free-text search across item names'),
      sortBy: z.string().optional().describe('Field to sort by'),
      sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
      limit: z.number().min(1).max(1000).optional().describe('Max items to return (default 100)'),
      offset: z.number().min(0).optional().describe('Pagination offset'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('inventory', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'inventory items' });
    }),
  );

  server.tool(
    'get_inventory_item',
    'Get a single inventory item by ID.',
    { id: z.string().describe('Inventory item ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`inventory/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_inventory_item',
    'Create a new inventory item.',
    {
      name: z.string().min(1).describe('Item name'),
      description: z.string().optional().describe('Optional description'),
      category: z.string().optional().describe('Category name'),
      quantity: z.number().min(0).optional().describe('Current quantity on hand'),
      unit: z.string().optional().describe('Unit of measure, e.g. "kg", "each"'),
      minQuantity: z.number().min(0).optional().describe('Minimum quantity threshold'),
      maxQuantity: z.number().min(0).optional().describe('Maximum quantity threshold'),
      parLevel: z.number().optional().describe('Par level for reorder'),
      cost: z.number().optional().describe('Cost per unit'),
      vendorId: z.string().optional().describe('Preferred vendor ID'),
      location: z.string().optional().describe('Storage location'),
      barcode: z.string().optional().describe('Barcode or UPC'),
      sku: z.string().optional().describe('SKU'),
      notes: z.string().optional().describe('Free-form notes'),
      status: z.string().optional().describe('Status: "active" or "inactive"'),
      requireDailyCount: z.boolean().optional().describe('Whether this item requires a daily count'),
      expirationDate: z.string().optional().describe('ISO datetime string for expiration date'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('inventory', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_inventory_item',
    'Update an existing inventory item. Only provide fields you want to change.',
    {
      id: z.string().describe('Inventory item ID'),
      name: z.string().optional().describe('New name'),
      description: z.string().optional(),
      category: z.string().optional(),
      quantity: z.number().optional().describe('New quantity on hand'),
      unit: z.string().optional(),
      minQuantity: z.number().optional(),
      maxQuantity: z.number().optional(),
      parLevel: z.number().optional(),
      cost: z.number().optional(),
      vendorId: z.string().optional(),
      location: z.string().optional(),
      barcode: z.string().optional(),
      sku: z.string().optional(),
      notes: z.string().optional(),
      status: z.string().optional(),
      requireDailyCount: z.boolean().optional(),
      expirationDate: z.string().optional().describe('ISO datetime string'),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`inventory/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_inventory_item',
    'Delete an inventory item by ID.',
    { id: z.string().describe('Inventory item ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`inventory/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );

  server.tool(
    'batch_update_inventory',
    'Batch update multiple inventory items in a single request. Max 200 items per batch.',
    {
      updates: z.array(z.object({
        id: z.string(),
        data: z.record(z.unknown()),
      })).min(1).max(200).describe('Array of {id, data} pairs to update'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.patch('inventory/batch', { updates: args.updates });
      return formatMutation(data, 'Updated');
    }),
  );
}
