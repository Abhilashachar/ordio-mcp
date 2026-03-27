/**
 * ordio MCP server configuration
 * Reads from environment variables at startup.
 */

export interface Config {
  /** Base URL of the ordio API, e.g. https://api.getordio.com */
  apiBaseUrl: string;
  /** Clerk API key used as Bearer token for all requests */
  apiKey: string;
  /** Organization ID scoped to all org-level tool calls */
  orgId: string;
  /** Transport mode: stdio (default) or sse for HTTP clients */
  transport: 'stdio' | 'sse';
  /** Port for the SSE HTTP server (only used when transport is 'sse') */
  port: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  return {
    apiBaseUrl: process.env.ORDIO_API_BASE_URL ?? 'https://api.getordio.com',
    apiKey: requireEnv('ORDIO_API_KEY'),
    orgId: requireEnv('ORDIO_ORG_ID'),
    transport: (process.env.ORDIO_MCP_TRANSPORT ?? 'stdio') as 'stdio' | 'sse',
    port: Number(process.env.ORDIO_MCP_PORT) || 3100,
  };
}
