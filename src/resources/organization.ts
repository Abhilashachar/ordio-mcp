import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { OrdioClient } from '../client.js';

export function registerOrganizationResources(server: McpServer, client: OrdioClient) {
  server.resource(
    'org-profile',
    'ordio://org/profile',
    { description: 'Organization profile and settings (name, timezone, currency)' },
    async (uri) => {
      const data = await client.get('settings');
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        }],
      };
    },
  );

  server.resource(
    'inventory-summary',
    'ordio://org/inventory-summary',
    { description: 'Inventory summary: total items, low stock count, expiring count' },
    async (uri) => {
      const items = await client.get<any[]>('inventory');
      const arr = Array.isArray(items) ? items : [];
      const summary = {
        totalItems: arr.length,
        activeItems: arr.filter((i: any) => i.status === 'active').length,
        lowStock: arr.filter((i: any) => i.parLevel && i.quantity < i.parLevel).length,
        expiringSoon: arr.filter((i: any) => {
          if (!i.expirationDate) return false;
          const days = (new Date(i.expirationDate).getTime() - Date.now()) / 86400000;
          return days >= 0 && days <= 3;
        }).length,
        outOfStock: arr.filter((i: any) => i.quantity === 0).length,
      };
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2),
        }],
      };
    },
  );

  server.resource(
    'active-alerts',
    'ordio://org/active-alerts',
    { description: 'Currently active/unresolved alerts' },
    async (uri) => {
      const data = await client.get('alerts');
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        }],
      };
    },
  );

  server.resource(
    'team-summary',
    'ordio://org/team-summary',
    { description: 'Team member count and today\'s shift schedule' },
    async (uri) => {
      const [members, shifts] = await Promise.all([
        client.get<any[]>('team-members'),
        client.get<any[]>('shifts'),
      ]);
      const membersArr = Array.isArray(members) ? members : [];
      const shiftsArr = Array.isArray(shifts) ? shifts : [];
      const today = new Date().toISOString().split('T')[0];
      const summary = {
        totalMembers: membersArr.length,
        activeMembers: membersArr.filter((m: any) => m.status === 'active').length,
        todayShifts: shiftsArr.filter((s: any) => s.date === today).length,
      };
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2),
        }],
      };
    },
  );

  server.resource(
    'daily-metrics',
    'ordio://org/daily-metrics',
    { description: 'Today\'s key metrics: alerts, tasks, shifts, inventory health' },
    async (uri) => {
      const [alerts, tasks, inventory] = await Promise.all([
        client.get<any[]>('alerts'),
        client.get<any[]>('tasks', { status: 'todo' }),
        client.get<any[]>('inventory'),
      ]);
      const alertsArr = Array.isArray(alerts) ? alerts : [];
      const tasksArr = Array.isArray(tasks) ? tasks : [];
      const invArr = Array.isArray(inventory) ? inventory : [];
      const metrics = {
        activeAlerts: alertsArr.length,
        pendingTasks: tasksArr.length,
        lowStockItems: invArr.filter((i: any) => i.parLevel && i.quantity < i.parLevel).length,
        outOfStockItems: invArr.filter((i: any) => i.quantity === 0).length,
      };
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(metrics, null, 2),
        }],
      };
    },
  );
}
