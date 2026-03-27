import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatMutation } from '../utils/format.js';

export function registerTemperatureLogTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_temperature_logs',
    'List temperature logs. Supports filtering by location, date range, and out-of-range status.',
    {
      locationName: z.string().optional().describe('Filter by location name'),
      startDate: z.string().optional().describe('Start date (ISO string)'),
      endDate: z.string().optional().describe('End date (ISO string)'),
      outOfRangeOnly: z.boolean().optional().describe('Only return out-of-range readings'),
      limit: z.number().min(1).max(1000).optional().describe('Max items to return (default 100)'),
      offset: z.number().min(0).optional().describe('Pagination offset'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('temperature-logs', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'temperature logs' });
    }),
  );

  server.tool(
    'create_temperature_log',
    'Record a new temperature log entry.',
    {
      locationName: z.string().min(1).describe('Location name, e.g. "Walk-in Cooler"'),
      temperature: z.number().describe('Recorded temperature value'),
      temperatureUnit: z.enum(['F', 'C']).optional().describe('Temperature unit (default F)'),
      minAcceptable: z.number().optional().describe('Minimum acceptable temperature'),
      maxAcceptable: z.number().optional().describe('Maximum acceptable temperature'),
      notes: z.string().optional().describe('Additional notes'),
      recordedBy: z.string().optional().describe('Name or ID of the person recording'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('temperature-logs', args);
      return formatMutation(data, 'Created');
    }),
  );
}
