/**
 * Format a raw `ToolExecutionResult` (from `POST .../assistant/tools/:name`,
 * returned verbatim by `OrdioClient.execTool`) into an MCP tool response.
 *
 * The gateway returns one of four `kind`s:
 *   - `result`              → the operation ran; surface `data`.
 *   - `confirm-required`    → the caller must re-submit with the given `confirmToken`.
 *   - `needs-clarification` → ambiguous input; surface candidates + prompt.
 *   - `denied`              → policy/permission refusal; surface as an MCP error.
 */

import { formatItem, formatList } from '../utils/format.js';
import { mcpError } from '../utils/errors.js';

/** Structurally compatible with the (unexported) MCP tool-result types. */
type TextResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

/** Loose shape matching `OrdioClient.execTool`'s raw return. */
type ExecResult = { kind: string; [key: string]: unknown };

function textResult(text: string): TextResult {
  return { content: [{ type: 'text', text }] };
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function candidateLabel(candidate: unknown): string {
  if (typeof candidate === 'string') return candidate;
  if (candidate && typeof candidate === 'object') {
    const c = candidate as Record<string, unknown>;
    const label = c.name ?? c.title ?? c.displayName ?? c.label ?? c.id;
    if (label !== undefined) return String(label);
  }
  return stringify(candidate);
}

export function formatExecResult(result: ExecResult): TextResult {
  switch (result.kind) {
    case 'result': {
      const data = result.data;
      if (data === null || data === undefined) return textResult('Done.');
      if (Array.isArray(data)) return formatList(data);
      if (typeof data === 'object') return formatItem(data);
      return textResult(String(data));
    }

    case 'confirm-required': {
      const token = String(result.confirmToken ?? '');
      const preview = stringify(result.preview);
      const parts = ['Confirmation required before this action runs.'];
      if (preview) parts.push(`Preview:\n${preview}`);
      parts.push(
        `To proceed, call this tool again with the same arguments plus confirmToken: '${token}'`,
      );
      return textResult(parts.join('\n\n'));
    }

    case 'needs-clarification': {
      const candidates = Array.isArray(result.candidates) ? result.candidates : [];
      const prompt = typeof result.prompt === 'string' ? result.prompt : '';
      const parts = ['Clarification needed to continue.'];
      if (prompt) parts.push(prompt);
      if (candidates.length > 0) {
        parts.push(
          ['Candidates:', ...candidates.map((c) => `- ${candidateLabel(c)}`)].join('\n'),
        );
      }
      return textResult(parts.join('\n\n'));
    }

    case 'denied': {
      const reason = typeof result.reason === 'string' ? result.reason : 'no reason given';
      return mcpError(`Denied: ${reason}`);
    }

    default:
      return textResult(stringify(result));
  }
}
