import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerStorageLocationTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_storage_locations',
    'List storage locations, optionally filtered by status or type',
    {
      status: z.string().optional().describe('Filter by location status'),
      type: z.string().optional().describe('Filter by location type'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('storage-locations', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'storage locations' });
    }),
  );

  server.tool(
    'get_storage_location',
    'Get a single storage location by ID',
    {
      id: z.string().describe('Storage location ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get(`storage-locations/${args.id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_storage_location',
    'Create a new storage location',
    {
      name: z.string().describe('Location name'),
      type: z.enum(['dry', 'refrigerated', 'frozen', 'ambient', 'heated']).optional().describe('Storage type'),
      description: z.string().optional().describe('Location description'),
      temperatureMin: z.number().optional().describe('Minimum temperature'),
      temperatureMax: z.number().optional().describe('Maximum temperature'),
      temperatureUnit: z.enum(['F', 'C']).optional().describe('Temperature unit'),
      status: z.string().optional().describe('Location status'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('storage-locations', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_storage_location',
    'Update a storage location',
    {
      id: z.string().describe('Storage location ID'),
      name: z.string().optional().describe('Location name'),
      type: z.enum(['dry', 'refrigerated', 'frozen', 'ambient', 'heated']).optional().describe('Storage type'),
      description: z.string().optional().describe('Location description'),
      temperatureMin: z.number().optional().describe('Minimum temperature'),
      temperatureMax: z.number().optional().describe('Maximum temperature'),
      temperatureUnit: z.enum(['F', 'C']).optional().describe('Temperature unit'),
      status: z.string().optional().describe('Location status'),
    },
    async (args) => withErrorHandling(async () => {
      const { id, ...body } = args;
      const data = await client.patch(`storage-locations/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_storage_location',
    'Delete a storage location',
    {
      id: z.string().describe('Storage location ID'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.delete(`storage-locations/${args.id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
