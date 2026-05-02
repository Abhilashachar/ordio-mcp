/**
 * Oracle MCP tools — exposes the situational read-model + manager decision
 * queue from ordio-api over MCP.
 *
 * Backed by:
 *   - GET /api/v1/oracle/state           — situational model
 *   - GET /api/v1/oracle/needs-you       — top decision + queue depth
 *   - POST /api/v1/oracle/needs-you/:id/accept
 *   - POST /api/v1/oracle/needs-you/:id/dismiss
 *   - GET /api/v1/oracle/needs-you/audit — paginated trust log
 *
 * See ordio-api/docs/ordio-oracle.md for the unified vision and the
 * §10.6 strategic note on MCP as the cross-stack platform play.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { formatItem } from '../utils/format.js';

export function registerOracleTools(server: McpServer, client: OrdioClient) {
  server.tool(
    'oracle_state',
    'Get the live Oracle situational model for the current org. Returns kitchen pace + bottleneck, open ticket late-risk, workers + break-law triggers, inventory items at risk of 86, and prep readiness for the upcoming daypart. The single best read for "what is happening right now" in the kitchen.',
    {},
    async () =>
      withErrorHandling(async () => {
        const data = await client.get('/oracle/state');
        return formatItem(data, 'Oracle state');
      })
  );

  server.tool(
    'oracle_needs_you',
    'Get the top-1 open NEEDS YOU recommendation for the current org plus queue depth. Each item is one decision Oracle has surfaced for human pick — categorized as service quality, P/L, or safety/compliance. Use this when the user asks "what needs my attention?" / "what should I do next?" / "anything urgent?".',
    {},
    async () =>
      withErrorHandling(async () => {
        const data = await client.get('/oracle/needs-you');
        return formatItem(data, 'Oracle NEEDS YOU');
      })
  );

  server.tool(
    'oracle_accept_recommendation',
    'Accept a NEEDS YOU recommendation. The recommendation moves to status=accepted, an audit row is written, and the queue advances to the next item.',
    {
      recommendationId: z.string().describe('The recommendation id (from oracle_needs_you topItem.id)'),
      override: z.record(z.unknown()).optional().describe('Optional override params for the action (e.g. swapping suggested worker)'),
    },
    async (args) =>
      withErrorHandling(async () => {
        const data = await client.post(
          `/oracle/needs-you/${encodeURIComponent(args.recommendationId)}/accept`,
          args.override ? { override: args.override } : {}
        );
        return formatItem(data, 'Accepted');
      })
  );

  server.tool(
    'oracle_dismiss_recommendation',
    'Dismiss a NEEDS YOU recommendation. The recommendation moves to status=dismissed, an audit row records the optional reason, and the queue advances. High dismiss rate per orchestrator is a signal to retune that orchestrator.',
    {
      recommendationId: z.string().describe('The recommendation id (from oracle_needs_you topItem.id)'),
      reason: z.string().optional().describe('Optional reason for dismissal — surfaces in the audit log'),
    },
    async (args) =>
      withErrorHandling(async () => {
        const data = await client.post(
          `/oracle/needs-you/${encodeURIComponent(args.recommendationId)}/dismiss`,
          args.reason ? { reason: args.reason } : {}
        );
        return formatItem(data, 'Dismissed');
      })
  );

  server.tool(
    'oracle_audit_log',
    'Get the Oracle audit log for the current org — every recommendation creation, accept, dismiss, snooze, expire, and L1 silent action. The trust device for the entire Oracle action layer (vision §7). Paginated.',
    {
      since: z.string().optional().describe('ISO timestamp lower bound (inclusive)'),
      until: z.string().optional().describe('ISO timestamp upper bound (inclusive)'),
      limit: z.number().int().min(1).max(500).optional().describe('Max rows (default 100, max 500)'),
    },
    async (args) =>
      withErrorHandling(async () => {
        const data = await client.get('/oracle/needs-you/audit', args as Record<string, string | number | boolean | undefined>);
        return formatItem(data, 'Oracle audit log');
      })
  );
}
