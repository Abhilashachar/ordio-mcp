/**
 * HTTP+SSE transport for ordio MCP server.
 * Allows web clients (ordio-web) to connect over HTTP instead of stdio.
 */

import http from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

export async function startSSEServer(server: McpServer, port: number): Promise<void> {
  let transport: SSEServerTransport | null = null;

  const httpServer = http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    // Set CORS headers on all responses
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(key, value);
    }

    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    if (url.pathname === '/sse' && req.method === 'GET') {
      // Create SSE transport — the endpoint for POST messages is '/messages'
      transport = new SSEServerTransport('/messages', res);
      await server.connect(transport);
      return;
    }

    if (url.pathname === '/messages' && req.method === 'POST') {
      if (!transport) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No active SSE connection. Connect to /sse first.' }));
        return;
      }
      await transport.handlePostMessage(req, res);
      return;
    }

    // Health check
    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', transport: 'sse', connected: !!transport }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  httpServer.listen(port, () => {
    process.stderr.write(`ordio MCP SSE server listening on http://localhost:${port}\n`);
    process.stderr.write(`  SSE endpoint: GET /sse\n`);
    process.stderr.write(`  Messages:     POST /messages\n`);
    process.stderr.write(`  Health:       GET /health\n`);
  });
}
