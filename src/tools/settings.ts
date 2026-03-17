import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerSettingsTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'get_settings',
    'Get all org settings as a key-value map.',
    {},
    async () => {
      const data = await client.get('settings');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_setting',
    'Get a single org setting by key.',
    { key: z.string().describe('Setting key, e.g. "timezone", "currency"') },
    async ({ key }) => {
      const data = await client.get(`settings/${key}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'upsert_setting',
    'Create or update an org setting key-value pair.',
    {
      key: z.string().min(1).describe('Setting key'),
      value: z.string().describe('Setting value (always stored as string)'),
    },
    async (args) => {
      const data = await client.post('settings', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_setting',
    'Delete an org setting by key.',
    { key: z.string().describe('Setting key to delete') },
    async ({ key }) => {
      const data = await client.delete(`settings/${key}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
