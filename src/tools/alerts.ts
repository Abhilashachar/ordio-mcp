import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';

export function registerAlertTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'list_alerts',
    'List all active alerts for the organization (low stock, overdue tasks, etc.).',
    {},
    async () => {
      const data = await client.get('alerts');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_alert',
    'Get a single alert by ID.',
    { id: z.string().describe('Alert ID') },
    async ({ id }) => {
      const data = await client.get(`alerts/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'mark_alert_read',
    'Mark an alert as read.',
    { id: z.string().describe('Alert ID') },
    async ({ id }) => {
      const data = await client.post(`alerts/${id}/read`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'dismiss_alert',
    'Dismiss an alert so it no longer appears.',
    { id: z.string().describe('Alert ID') },
    async ({ id }) => {
      const data = await client.post(`alerts/${id}/dismiss`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_alert',
    'Permanently delete an alert.',
    { id: z.string().describe('Alert ID') },
    async ({ id }) => {
      const data = await client.delete(`alerts/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  // ── Alert Configurations ─────────────────────────────────────

  server.tool(
    'list_alert_configurations',
    'List all alert rule configurations (e.g. low stock thresholds).',
    {},
    async () => {
      const data = await client.get('alerts/configurations');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'create_alert_configuration',
    'Create a new alert rule configuration.',
    {
      name: z.string().min(1).describe('Configuration name'),
      type: z.string().min(1).describe('Alert type, e.g. "low_stock", "task_overdue"'),
      isEnabled: z.boolean().optional().describe('Whether the rule is active'),
      severity: z.string().optional().describe('"low", "medium", or "high"'),
      conditions: z.array(z.record(z.unknown())).optional().describe('Trigger conditions'),
      actions: z.array(z.record(z.unknown())).optional().describe('Actions to take when triggered'),
      cooldownMinutes: z.string().optional().describe('Minimum minutes between repeat alerts'),
    },
    async (args) => {
      const data = await client.post('alerts/configurations', args);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'update_alert_configuration',
    'Update an alert rule configuration.',
    {
      id: z.string().describe('Alert configuration ID'),
      name: z.string().optional(),
      isEnabled: z.boolean().optional(),
      severity: z.string().optional(),
      conditions: z.array(z.record(z.unknown())).optional(),
      actions: z.array(z.record(z.unknown())).optional(),
      cooldownMinutes: z.string().optional(),
    },
    async ({ id, ...body }) => {
      const data = await client.patch(`alerts/configurations/${id}`, body);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'delete_alert_configuration',
    'Delete an alert rule configuration.',
    { id: z.string().describe('Alert configuration ID') },
    async ({ id }) => {
      const data = await client.delete(`alerts/configurations/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
