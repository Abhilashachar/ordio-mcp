import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerInvoiceTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_invoices',
    'List all invoices for the organization.',
    {
      status: z.string().optional().describe('Filter by status: "uploaded", "processed", "paid", etc.'),
      vendorId: z.string().optional().describe('Filter by vendor ID'),
      search: z.string().optional(),
      startDate: z.string().optional().describe('ISO date string — filter invoices from this date'),
      endDate: z.string().optional().describe('ISO date string — filter invoices up to this date'),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional(),
    },
    async (args) => {
      const data = await client.get('invoices', args as Record<string, string>);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_invoice',
    'Get a single invoice by ID.',
    { id: z.string().describe('Invoice ID') },
    async ({ id }) => {
      const data = await client.get(`invoices/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'create_invoice',
    'Create a new invoice record.',
    {
      vendorId: z.string().min(1).describe('Vendor ID'),
      vendorName: z.string().optional(),
      invoiceNumber: z.string().min(1).describe('Invoice number from the vendor'),
      title: z.string().optional(),
      date: z.string().optional().describe('Invoice date (ISO datetime)'),
      dueDate: z.string().optional().describe('Payment due date (ISO datetime)'),
      subtotal: z.number().optional(),
      tax: z.number().optional(),
      total: z.number().optional(),
      status: z.string().optional().describe('e.g. "uploaded", "processed"'),
      notes: z.string().optional(),
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unitPrice: z.number(),
        totalPrice: z.number().optional(),
        tax: z.number().optional(),
        inventoryItemId: z.string().optional().nullable(),
      })).optional(),
    },
    async (args) => {
      const data = await client.post('invoices', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'update_invoice',
    'Update an existing invoice.',
    {
      id: z.string().describe('Invoice ID'),
      status: z.string().optional(),
      notes: z.string().optional(),
      subtotal: z.number().optional(),
      tax: z.number().optional(),
      total: z.number().optional(),
      dueDate: z.string().optional(),
    },
    async ({ id, ...body }) => {
      const data = await client.patch(`invoices/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_invoice',
    'Delete an invoice by ID.',
    { id: z.string().describe('Invoice ID') },
    async ({ id }) => {
      const data = await client.delete(`invoices/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
