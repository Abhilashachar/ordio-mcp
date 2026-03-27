import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatItem, formatList } from '../utils/format.js';

export function registerSearchTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'semantic_search',
    'Search across organization data using natural language. Uses AI embeddings for semantic matching.',
    {
      query: z.string().describe('Natural language search query'),
      collectionType: z.enum(['inventory', 'recipe']).optional().describe('Limit search to a specific collection type'),
      limit: z.number().min(1).max(50).optional().describe('Max results'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('analytics/semantic-search', args);
      return formatList(data, { label: 'search results' });
    }),
  );
}
