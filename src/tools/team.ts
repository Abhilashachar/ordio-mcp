import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatList, formatItem, formatMutation } from '../utils/format.js';

export function registerTeamTools(server: McpServer, client: OrdioClient) {
  // ── Team Members ─────────────────────────────────────────────

  server.tool(
    'list_team_members',
    'List all team members for the organization.',
    {
      status: z.string().optional().describe('Filter by status: "active" or "inactive"'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.get('team-members', args as Record<string, string | number | boolean | undefined>);
      return formatList(data, { label: 'team members' });
    }),
  );

  server.tool(
    'get_team_member',
    'Get a single team member by ID.',
    { id: z.string().describe('Team member ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.get(`team-members/${id}`);
      return formatItem(data);
    }),
  );

  server.tool(
    'create_team_member',
    'Add a new team member to the organization.',
    {
      displayName: z.string().min(1).describe('Full display name'),
      email: z.string().email().describe('Email address'),
      hourlyRate: z.number().optional().describe('Hourly pay rate'),
      employmentType: z.string().optional().describe('"hourly" or "salary"'),
      annualSalary: z.number().optional(),
      departmentId: z.string().optional().describe('Department ID'),
      laborRoleId: z.string().optional(),
      hireDate: z.string().optional().describe('ISO date string'),
      status: z.string().optional().describe('"active" or "inactive"'),
      imageUrl: z.string().optional(),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('team-members', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_team_member',
    'Update an existing team member.',
    {
      id: z.string().describe('Team member ID'),
      displayName: z.string().optional(),
      email: z.string().optional(),
      hourlyRate: z.number().optional(),
      employmentType: z.string().optional(),
      annualSalary: z.number().optional(),
      departmentId: z.string().optional(),
      status: z.string().optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`team-members/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_team_member',
    'Remove a team member from the organization.',
    { id: z.string().describe('Team member ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`team-members/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );

  // ── Departments ───────────────────────────────────────────────

  server.tool(
    'list_departments',
    'List all departments in the organization.',
    {},
    async () => withErrorHandling(async () => {
      const data = await client.get('departments');
      return formatList(data, { label: 'departments' });
    }),
  );

  server.tool(
    'create_department',
    'Create a new department.',
    {
      name: z.string().min(1).describe('Department name'),
      description: z.string().optional(),
      color: z.string().optional().describe('Hex color code'),
      managerId: z.string().optional().describe('Team member ID of the department manager'),
    },
    async (args) => withErrorHandling(async () => {
      const data = await client.post('departments', args);
      return formatMutation(data, 'Created');
    }),
  );

  server.tool(
    'update_department',
    'Update a department.',
    {
      id: z.string().describe('Department ID'),
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      managerId: z.string().optional(),
    },
    async ({ id, ...body }) => withErrorHandling(async () => {
      const data = await client.patch(`departments/${id}`, body);
      return formatMutation(data, 'Updated');
    }),
  );

  server.tool(
    'delete_department',
    'Delete a department.',
    { id: z.string().describe('Department ID') },
    async ({ id }) => withErrorHandling(async () => {
      const data = await client.delete(`departments/${id}`);
      return formatMutation(data, 'Deleted');
    }),
  );
}
