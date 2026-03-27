import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerEquipmentTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_equipment',
    'List all equipment. Supports filtering by status, category, and free-text search.',
    {
      status: z.string().optional().describe('Filter by status, e.g. "operational"'),
      category: z.string().optional().describe('Filter by category'),
      search: z.string().optional().describe('Free-text search across equipment names'),
      limit: z.number().min(1).max(1000).optional().describe('Max items to return (default 100)'),
      offset: z.number().min(0).optional().describe('Pagination offset'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('equipment', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'equipment' });
    }),
  );

  server.tool(
    'get_equipment',
    'Get a single equipment item by ID.',
    { id: z.string().describe('Equipment ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`equipment/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_equipment',
    'Create a new equipment record.',
    {
      name: z.string().min(1).describe('Equipment name'),
      model: z.string().optional().describe('Model name or number'),
      serialNumber: z.string().optional().describe('Serial number'),
      manufacturer: z.string().optional().describe('Manufacturer name'),
      location: z.string().optional().describe('Physical location'),
      category: z.string().optional().describe('Equipment category'),
      status: z.enum(['operational', 'maintenance', 'retired']).optional().describe('Equipment status'),
      purchaseDate: z.string().optional().describe('Purchase date (ISO string)'),
      warrantyExpiration: z.string().optional().describe('Warranty expiration date (ISO string)'),
      notes: z.string().optional().describe('Free-form notes'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('equipment', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_equipment',
    'Update an existing equipment record. Only provide fields you want to change.',
    {
      id: z.string().describe('Equipment ID'),
      name: z.string().optional().describe('New name'),
      model: z.string().optional().describe('Model name or number'),
      serialNumber: z.string().optional().describe('Serial number'),
      manufacturer: z.string().optional().describe('Manufacturer name'),
      location: z.string().optional().describe('Physical location'),
      category: z.string().optional().describe('Equipment category'),
      status: z.enum(['operational', 'maintenance', 'retired']).optional().describe('Equipment status'),
      purchaseDate: z.string().optional().describe('Purchase date (ISO string)'),
      warrantyExpiration: z.string().optional().describe('Warranty expiration date (ISO string)'),
      notes: z.string().optional().describe('Free-form notes'),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`equipment/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );
}
