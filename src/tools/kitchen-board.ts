import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerKitchenBoardTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_kitchen_orders',
    'List kitchen board orders, optionally filtered by status or station',
    {
      status: z.string().optional().describe('Filter by order status'),
      stationId: z.string().optional().describe('Filter by station ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('kitchen-board/orders', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'kitchen orders' });
    }),
  );

  server.tool(
    'get_kitchen_order',
    'Get a single kitchen board order by ID',
    {
      id: z.string().describe('Kitchen order ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get(`kitchen-board/orders/${args.id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_kitchen_order',
    'Create a new kitchen board order',
    {
      orderNumber: z.string().describe('Order number'),
      items: z.array(z.object({
        name: z.string().describe('Item name'),
        quantity: z.number().describe('Item quantity'),
        notes: z.string().optional().describe('Item notes'),
      })).describe('Order items'),
      priority: z.enum(['normal', 'rush', 'fire']).optional().describe('Order priority'),
      stationId: z.string().optional().describe('Assigned station ID'),
      notes: z.string().optional().describe('Order notes'),
      status: z.string().optional().describe('Order status'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('kitchen-board/orders', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_kitchen_order',
    'Update a kitchen board order',
    {
      id: z.string().describe('Kitchen order ID'),
      status: z.string().optional().describe('Order status'),
      priority: z.string().optional().describe('Order priority'),
      stationId: z.string().optional().describe('Assigned station ID'),
      notes: z.string().optional().describe('Order notes'),
      completedAt: z.string().optional().describe('Completion timestamp (ISO 8601)'),
    },
    async (args) => withErrorHandling(async () => {
      const { id, ...body } = args;
      const data = await client.patch(`kitchen-board/orders/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_kitchen_order',
    'Delete a kitchen board order',
    {
      id: z.string().describe('Kitchen order ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.delete(`kitchen-board/orders/${args.id}`);
      return formatMutation(data, 'Deleted');
    }),
  );

  server.tool(
    'list_kitchen_stations',
    'List all kitchen stations',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('kitchen-board/stations');
      return formatList(data, { label: 'kitchen stations' });
    }),
  );

  server.tool(
    'create_kitchen_station',
    'Create a new kitchen station',
    {
      name: z.string().describe('Station name'),
      description: z.string().optional().describe('Station description'),
      color: z.string().optional().describe('Station color (hex)'),
      isActive: z.boolean().optional().describe('Whether the station is active'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('kitchen-board/stations', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_kitchen_station',
    'Update a kitchen station',
    {
      id: z.string().describe('Station ID'),
      name: z.string().optional().describe('Station name'),
      description: z.string().optional().describe('Station description'),
      color: z.string().optional().describe('Station color (hex)'),
      isActive: z.boolean().optional().describe('Whether the station is active'),
    },
    async (args) => withErrorHandling(async () => {
      const { id, ...body } = args;
      const data = await client.patch(`kitchen-board/stations/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_kitchen_station',
    'Delete a kitchen station',
    {
      id: z.string().describe('Station ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.delete(`kitchen-board/stations/${args.id}`);
      return formatMutation(data, 'Deleted');
    }),
  );

  server.tool(
    'list_station_groups',
    'List all station groups',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('kitchen-board/station-groups');
      return formatList(data, { label: 'station groups' });
    }),
  );

  server.tool(
    'list_routing_rules',
    'List all kitchen routing rules',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('kitchen-board/routing-rules');
      return formatList(data, { label: 'routing rules' });
    }),
  );

  server.tool(
    'create_routing_rule',
    'Create a new kitchen routing rule',
    {
      name: z.string().describe('Rule name'),
      description: z.string().optional().describe('Rule description'),
      conditions: z.array(z.record(z.unknown())).optional().describe('Rule conditions'),
      targetStationId: z.string().optional().describe('Target station ID'),
      priority: z.number().optional().describe('Rule priority'),
      isActive: z.boolean().optional().describe('Whether the rule is active'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('kitchen-board/routing-rules', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'list_bumped_orders',
    'List all bumped orders',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('kitchen-board/bumped-orders');
      return formatList(data, { label: 'bumped orders' });
    }),
  );

  server.tool(
    'bump_order',
    'Bump a kitchen order',
    {
      orderId: z.string().describe('Order ID to bump'),
      reason: z.string().optional().describe('Reason for bumping'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('kitchen-board/bumped-orders', args);
      return formatMutation(data, 'Created');
    }),
  );
}
