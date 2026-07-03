import { describe, it, expect } from 'vitest';
import { formatExecResult } from '../../src/catalog/format.js';

function text(result: { content: { type: string; text: string }[] }): string {
  return result.content.map((c) => c.text).join('\n');
}

describe('formatExecResult', () => {
  it("formats kind:'result' with object data", () => {
    const out = formatExecResult({ kind: 'result', data: { id: 'sh_1', name: 'Morning shift' } });
    expect(out.isError).toBeFalsy();
    const t = text(out);
    expect(t).toContain('sh_1');
    expect(t).toContain('Morning shift');
  });

  it("formats kind:'result' with array data as a list", () => {
    const out = formatExecResult({
      kind: 'result',
      data: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    });
    const t = text(out);
    expect(t).toContain('2');
    expect(t).toContain('A');
    expect(t).toContain('B');
  });

  it("formats kind:'result' with scalar/string data", () => {
    const out = formatExecResult({ kind: 'result', data: 'Shift published.' });
    expect(text(out)).toContain('Shift published.');
    expect(out.isError).toBeFalsy();
  });

  it("formats kind:'confirm-required' including preview and the confirmToken instruction", () => {
    const out = formatExecResult({
      kind: 'confirm-required',
      preview: 'This will delete 3 shifts',
      confirmToken: 'tok_abc123',
      args: { ids: ['a', 'b', 'c'] },
    });
    const t = text(out);
    // Explains confirmation is required
    expect(t.toLowerCase()).toContain('confirm');
    // Includes the preview summary
    expect(t).toContain('This will delete 3 shifts');
    // Instructs to call again with the literal token
    expect(t).toContain('confirmToken');
    expect(t).toContain('tok_abc123');
    expect(out.isError).toBeFalsy();
  });

  it("formats kind:'confirm-required' with an object preview", () => {
    const out = formatExecResult({
      kind: 'confirm-required',
      preview: { action: 'delete', count: 3 },
      confirmToken: 'tok_xyz',
    });
    const t = text(out);
    expect(t).toContain('tok_xyz');
    expect(t).toContain('delete');
  });

  it("formats kind:'needs-clarification' listing candidates and prompt", () => {
    const out = formatExecResult({
      kind: 'needs-clarification',
      prompt: 'Which station did you mean?',
      candidates: [
        { id: 's1', name: 'Grill' },
        { id: 's2', name: 'Fry' },
      ],
    });
    const t = text(out);
    expect(t).toContain('Which station did you mean?');
    expect(t).toContain('Grill');
    expect(t).toContain('Fry');
    expect(out.isError).toBeFalsy();
  });

  it("formats kind:'needs-clarification' with string candidates", () => {
    const out = formatExecResult({
      kind: 'needs-clarification',
      prompt: 'Pick one',
      candidates: ['Alpha', 'Beta'],
    });
    const t = text(out);
    expect(t).toContain('Alpha');
    expect(t).toContain('Beta');
  });

  it("formats kind:'denied' as an error via mcpError", () => {
    const out = formatExecResult({ kind: 'denied', reason: 'insufficient permissions' });
    expect(out.isError).toBe(true);
    expect(text(out)).toContain('Denied: insufficient permissions');
  });

  it('does not throw on an unknown kind', () => {
    expect(() => formatExecResult({ kind: 'mystery', foo: 'bar' })).not.toThrow();
  });
});
