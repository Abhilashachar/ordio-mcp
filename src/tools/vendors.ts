import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerVendorTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_vendors',
    'List all vendors for the organization.',
    {
      status: z.string().optional().describe('Filter by status, e.g. "active"'),
      search: z.string().optional().describe('Free-text search across vendor names'),
    },
    async (args) => {
      const data = await client.get('vendors', args as Record<string, string>);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_vendor',
    'Get a single vendor by ID.',
    { id: z.string().describe('Vendor ID') },
    async ({ id }) => {
      const data = await client.get(`vendors/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'create_vendor',
    'Create a new vendor.',
    {
      name: z.string().min(1).describe('Vendor name'),
      contactName: z.string().optional().describe('Primary contact name'),
      email: z.string().optional().describe('Vendor email address'),
      phone: z.string().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
      status: z.string().optional().describe('"active" or "inactive"'),
      paymentTerms: z.string().optional().describe('e.g. "Net 30"'),
      taxId: z.string().optional(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string(),
      }).optional(),
    },
    async (args) => {
      const data = await client.post('vendors', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'update_vendor',
    'Update an existing vendor. Only include fields to change.',
    {
      id: z.string().describe('Vendor ID'),
      name: z.string().optional(),
      contactName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
      status: z.string().optional(),
      paymentTerms: z.string().optional(),
      taxId: z.string().optional(),
    },
    async ({ id, ...body }) => {
      const data = await client.patch(`vendors/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_vendor',
    'Delete a vendor by ID.',
    { id: z.string().describe('Vendor ID') },
    async ({ id }) => {
      const data = await client.delete(`vendors/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
