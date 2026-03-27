import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerOrderTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_orders',
    'List all purchase orders for the organization.',
    {
      status: z.string().optional().describe('Filter by status: "draft", "sent", "received", etc.'),
      vendorId: z.string().optional().describe('Filter by vendor ID'),
      search: z.string().optional().describe('Free-text search'),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('orders', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'orders' });
    }),
  );

  server.tool(
    'get_order',
    'Get a single purchase order by ID.',
    { id: z.string().describe('Order ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`orders/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_order',
    'Create a new purchase order.',
    {
      orderNumber: z.string().min(1).describe('Order number / reference'),
      vendorId: z.string().min(1).describe('Vendor ID'),
      vendorName: z.string().min(1).describe('Vendor display name'),
      vendorEmail: z.string().optional(),
      vendorPhone: z.string().optional(),
      status: z.string().optional().describe('Initial status, e.g. "draft"'),
      items: z.array(z.object({
        id: z.string(),
        inventoryItemId: z.string(),
        inventoryItemName: z.string(),
        currentQuantity: z.number(),
        minQuantity: z.number(),
        requestedQuantity: z.number(),
        unit: z.string(),
        estimatedCost: z.number().optional(),
        notes: z.string().optional(),
      })).optional().describe('Line items to order'),
      totalEstimatedCost: z.number().optional(),
      notes: z.string().optional(),
      deliveryDate: z.string().optional().describe('ISO datetime for expected delivery'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('orders', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_order',
    'Update an existing purchase order.',
    {
      id: z.string().describe('Order ID'),
      status: z.string().optional(),
      notes: z.string().optional(),
      deliveryDate: z.string().optional(),
      totalEstimatedCost: z.number().optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`orders/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_order',
    'Delete a purchase order by ID.',
    { id: z.string().describe('Order ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`orders/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
