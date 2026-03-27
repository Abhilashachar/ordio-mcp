import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerUnitTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_units',
    'List all units of measure. Supports filtering by status and type.',
    {
      status: z.string().optional().describe('Filter by status'),
      type: z.string().optional().describe('Filter by type, e.g. "weight", "volume"'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('units', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'units' });
    }),
  );

  server.tool(
    'get_unit',
    'Get a single unit of measure by ID.',
    { id: z.string().describe('Unit ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`units/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_unit',
    'Create a new unit of measure.',
    {
      name: z.string().min(1).describe('Unit name, e.g. "Kilogram"'),
      abbreviation: z.string().min(1).describe('Unit abbreviation, e.g. "kg"'),
      type: z.enum(['weight', 'volume', 'count', 'length', 'temperature']).optional().describe('Unit type'),
      conversionFactor: z.number().optional().describe('Conversion factor relative to the base unit'),
      baseUnit: z.string().optional().describe('Base unit ID for conversions'),
      status: z.string().optional().describe('Status, e.g. "active"'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('units', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_unit',
    'Update an existing unit of measure. Only provide fields you want to change.',
    {
      id: z.string().describe('Unit ID'),
      name: z.string().optional().describe('New name'),
      abbreviation: z.string().optional().describe('New abbreviation'),
      type: z.enum(['weight', 'volume', 'count', 'length', 'temperature']).optional().describe('Unit type'),
      conversionFactor: z.number().optional().describe('Conversion factor relative to the base unit'),
      baseUnit: z.string().optional().describe('Base unit ID for conversions'),
      status: z.string().optional().describe('Status'),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`units/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_unit',
    'Delete a unit of measure by ID.',
    { id: z.string().describe('Unit ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`units/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
