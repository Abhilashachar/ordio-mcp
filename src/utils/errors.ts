/**
 * Structured error handling for MCP tool responses.
 * Wraps OrdioClient errors into actionable MCP responses.
 */

export class OrdioApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
    public readonly suggestion?: string,
  ) {
    super(message);
    this.name = 'OrdioApiError';
  }
}

type McpToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export function mcpError(message: string): McpToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

export function mcpSuccess(text: string): McpToolResult {
  return { content: [{ type: 'text', text }] };
}

function suggestionForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Check the request parameters — some fields may be invalid or missing.';
    case 401:
    case 403:
      return 'Authentication failed. Verify ORDIO_API_KEY is valid and has access to this organization.';
    case 404:
      return 'Resource not found. Use a list tool to find valid IDs.';
    case 409:
      return 'Conflict — this resource may already exist or was modified concurrently.';
    case 422:
      return 'Validation failed. Check field values and formats.';
    case 429:
      return 'Rate limited. Wait a moment and retry.';
    default:
      if (status >= 500) return 'Server error on ordio API. Retry or escalate.';
      return '';
  }
}

export function buildApiError(status: number, body: unknown): OrdioApiError {
  const err = body as { message?: string; error?: string; errors?: unknown };
  const msg = err?.message ?? err?.error ?? `HTTP ${status}`;
  const suggestion = suggestionForStatus(status);
  return new OrdioApiError(msg, status, err?.errors, suggestion);
}

export function withErrorHandling(
  fn: () => Promise<McpToolResult>,
): Promise<McpToolResult> {
  return fn().catch((err: unknown) => {
    if (err instanceof OrdioApiError) {
      const parts = [`Error: ${err.message}`];
      if (err.details) parts.push(`Details: ${JSON.stringify(err.details)}`);
      if (err.suggestion) parts.push(err.suggestion);
      return mcpError(parts.join('\n'));
    }
    const message = err instanceof Error ? err.message : String(err);
    return mcpError(`Unexpected error: ${message}`);
  });
}
