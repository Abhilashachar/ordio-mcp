/**
 * Response formatting utilities for MCP tool responses.
 * Produces concise, LLM-friendly summaries while preserving raw data access.
 */

type McpToolResult = {
  content: Array<{ type: 'text'; text: string }>;
};

const MAX_LIST_ITEMS = 50;

function extractLabel(item: Record<string, unknown>): string {
  return String(
    item.name ?? item.title ?? item.displayName ?? item.id ?? 'item',
  );
}

function extractKeyFields(item: Record<string, unknown>): string {
  const fields: string[] = [];
  if (item.name) fields.push(`name: ${item.name}`);
  if (item.status) fields.push(`status: ${item.status}`);
  if (item.quantity !== undefined) fields.push(`qty: ${item.quantity}${item.unit ? ' ' + item.unit : ''}`);
  if (item.cost !== undefined) fields.push(`cost: $${item.cost}`);
  if (item.total !== undefined) fields.push(`total: $${item.total}`);
  return fields.join(', ');
}

export function formatList(
  data: unknown,
  options?: { label?: string; summary?: string },
): McpToolResult {
  const items = Array.isArray(data) ? data : [];
  const label = options?.label ?? 'items';
  const parts: string[] = [];

  parts.push(`Found ${items.length} ${label}.`);
  if (options?.summary) parts.push(options.summary);

  if (items.length > 0 && items.length <= MAX_LIST_ITEMS) {
    parts.push(JSON.stringify(items, null, 2));
  } else if (items.length > MAX_LIST_ITEMS) {
    parts.push(JSON.stringify(items.slice(0, MAX_LIST_ITEMS), null, 2));
    parts.push(`... and ${items.length - MAX_LIST_ITEMS} more ${label}.`);
  }

  return { content: [{ type: 'text', text: parts.join('\n') }] };
}

export function formatItem(
  data: unknown,
  label?: string,
): McpToolResult {
  const item = data as Record<string, unknown> | null;
  if (!item) return { content: [{ type: 'text', text: 'No data returned.' }] };

  const name = label ?? extractLabel(item);
  const keyFields = extractKeyFields(item);
  const parts: string[] = [];

  if (keyFields) {
    parts.push(`${name}: ${keyFields}`);
  }
  parts.push(JSON.stringify(item, null, 2));

  return { content: [{ type: 'text', text: parts.join('\n') }] };
}

export function formatMutation(
  data: unknown,
  action: 'Created' | 'Updated' | 'Deleted',
): McpToolResult {
  const item = data as Record<string, unknown> | null;
  const name = item ? extractLabel(item) : '';
  const summary = name
    ? `${action} "${name}" successfully.`
    : `${action} successfully.`;

  const parts = [summary];
  if (data && action !== 'Deleted') {
    parts.push(JSON.stringify(data, null, 2));
  }

  return { content: [{ type: 'text', text: parts.join('\n') }] };
}
