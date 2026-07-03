/**
 * Register one MCP tool per entry in the ordio assistant tool manifest.
 *
 * This is the whole "catalog proxy": instead of 27 hand-written tool files,
 * we fetch the permission-filtered manifest at startup, convert each tool's
 * JSON-Schema `parameters` into a Zod shape, and register a passthrough
 * handler that executes the tool through the API gateway.
 *
 * Graceful degradation is deliberate and load-bearing: if the manifest fetch
 * fails (e.g. the endpoint isn't deployed yet), we log to stderr and register
 * ZERO tools rather than throwing. An unguarded throw here would reject
 * `main()` → `main().catch` → `process.exit(1)`, so the MCP server would not
 * boot at all. `withErrorHandling` only guards per-CALL execution, not startup.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { OrdioClient } from '../client.js';
import { withErrorHandling } from '../utils/errors.js';
import { parametersToZodShape, type JsonSchemaObject } from './schema.js';
import { formatExecResult } from './format.js';

interface CatalogTool {
  name: string;
  description?: string;
  parameters?: JsonSchemaObject;
}

export async function registerCatalogTools(server: McpServer, client: OrdioClient): Promise<void> {
  let manifest: { tools?: unknown[]; version?: string };
  try {
    manifest = await client.getToolManifest();
  } catch (err) {
    // MUST degrade, not crash — see the file header. A manifest outage or the
    // pre-deploy state becomes a reachable-but-empty server, not a boot failure.
    process.stderr.write(
      `[catalog] manifest fetch failed; registering 0 tools: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    return;
  }

  // A malformed 200 body (non-object, or `tools` not an array) degrades to zero
  // tools instead of throwing on iteration.
  const tools = (Array.isArray(manifest?.tools) ? manifest.tools : []) as CatalogTool[];

  for (const tool of tools) {
    // Guard each registration independently: one bad entry (e.g. a duplicate
    // tool name that makes `server.tool` throw) is skipped with a warning, the
    // rest still register. A single malformed tool must not drop the catalog.
    try {
      const shape = {
        ...parametersToZodShape(tool.parameters),
        confirmToken: z
          .string()
          .optional()
          .describe('Only when re-submitting a confirmation-required action'),
      };

      server.tool(tool.name, tool.description ?? '', shape, async ({ confirmToken, ...args }) =>
        withErrorHandling(async () =>
          formatExecResult(await client.execTool(tool.name, args, confirmToken)),
        ),
      );
    } catch (err) {
      process.stderr.write(
        `[catalog] skipped tool ${tool?.name ?? '<unknown>'}: ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
  }
}
