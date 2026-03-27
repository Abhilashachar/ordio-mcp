import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatItem, formatMutation } from '../utils/format.js';

export function registerSettingsTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'get_settings',
    'Get all org settings as a key-value map.',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('settings');
      return formatItem(data);
    }),
  );

  server.tool(
    'get_setting',
    'Get a single org setting by key.',
    { key: z.string().describe('Setting key, e.g. "timezone", "currency"') },
    async ({ key }) => withErrorHandling(async () => {
      const data = await client.get(`settings/${key}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'upsert_setting',
    'Create or update an org setting key-value pair.',
    {
      key: z.string().min(1).describe('Setting key'),
      value: z.string().describe('Setting value (always stored as string)'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('settings', args);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_setting',
    'Delete an org setting by key.',
    { key: z.string().describe('Setting key to delete') },
    async ({ key }) => withErrorHandling(async () => {
      const data = await client.delete(`settings/${key}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
