import { describe, it, expect, vi } from 'vitest';
import { registerCatalogTools } from '../../src/catalog/register.js';
import { formatExecResult } from '../../src/catalog/format.js';

/** A single captured `server.tool(...)` registration. */
interface Captured {
  name: string;
  description: string;
  shape: Record<string, { isOptional?: () => boolean }>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

function makeStubServer() {
  const calls: Captured[] = [];
  const server = {
    tool(
      name: string,
      description: string,
      shape: Captured['shape'],
      handler: Captured['handler'],
    ) {
      calls.push({ name, description, shape, handler });
    },
  };
  return { server, calls };
}

const MANIFEST = {
  tools: [
    { name: 'list_shifts', description: 'List all scheduled shifts.' },
    {
      name: 'create_shift',
      description: 'Create a new shift.',
      parameters: {
        type: 'object',
        properties: { date: { type: 'string', description: 'YYYY-MM-DD' } },
        required: ['date'],
      },
    },
  ],
  version: '2026-07-03',
};

const EXEC_RESULT = { kind: 'result', data: { id: 'sh_1', name: 'Morning shift' } };

function makeStubClient() {
  return {
    getToolManifest: vi.fn().mockResolvedValue(MANIFEST),
    execTool: vi.fn().mockResolvedValue(EXEC_RESULT),
  };
}

describe('registerCatalogTools', () => {
  it('registers one MCP tool per manifest entry with the right name & description', async () => {
    const { server, calls } = makeStubServer();
    const client = makeStubClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await registerCatalogTools(server as any, client as any);

    expect(calls.map((c) => c.name)).toEqual(['list_shifts', 'create_shift']);
    expect(calls[0].description).toBe('List all scheduled shifts.');
    expect(calls[1].description).toBe('Create a new shift.');
  });

  it('adds an optional confirmToken field to every registered shape', async () => {
    const { server, calls } = makeStubServer();
    const client = makeStubClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await registerCatalogTools(server as any, client as any);

    // Zero-arg tool: just confirmToken.
    expect(Object.keys(calls[0].shape)).toEqual(['confirmToken']);
    expect(calls[0].shape.confirmToken.isOptional?.()).toBe(true);

    // Parameterized tool: converted params PLUS confirmToken.
    expect(Object.keys(calls[1].shape).sort()).toEqual(['confirmToken', 'date']);
    expect(calls[1].shape.confirmToken.isOptional?.()).toBe(true);
  });

  it('splits confirmToken out of args and passes it as the 3rd exec arg', async () => {
    const { server, calls } = makeStubServer();
    const client = makeStubClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await registerCatalogTools(server as any, client as any);

    const createShift = calls.find((c) => c.name === 'create_shift')!;
    const out = await createShift.handler({ date: '2026-07-03', confirmToken: 't' });

    // confirmToken removed from args; forwarded as the confirmToken parameter.
    expect(client.execTool).toHaveBeenCalledWith('create_shift', { date: '2026-07-03' }, 't');
    // Handler returns exactly what formatExecResult produces for the exec result.
    expect(out).toEqual(formatExecResult(EXEC_RESULT));
  });

  it('does NOT throw and registers ZERO tools when getToolManifest rejects', async () => {
    const { server, calls } = makeStubServer();
    const client = {
      getToolManifest: vi.fn().mockRejectedValue(new Error('endpoint not deployed yet')),
      execTool: vi.fn(),
    };

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerCatalogTools(server as any, client as any),
    ).resolves.toBeUndefined();

    expect(calls).toHaveLength(0);
    expect(client.getToolManifest).toHaveBeenCalledTimes(1);
  });

  it('resolves with zero tools when a 200 body has no tools key', async () => {
    const { server, calls } = makeStubServer();
    const client = {
      getToolManifest: vi.fn().mockResolvedValue({}),
      execTool: vi.fn(),
    };

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerCatalogTools(server as any, client as any),
    ).resolves.toBeUndefined();

    expect(calls).toHaveLength(0);
  });

  it('resolves with zero tools when tools is not an array', async () => {
    const { server, calls } = makeStubServer();
    const client = {
      getToolManifest: vi.fn().mockResolvedValue({ tools: 'not-an-array' }),
      execTool: vi.fn(),
    };

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerCatalogTools(server as any, client as any),
    ).resolves.toBeUndefined();

    expect(calls).toHaveLength(0);
  });

  it('skips a tool whose registration throws and still registers the rest', async () => {
    const calls: Captured[] = [];
    const server = {
      tool(
        name: string,
        description: string,
        shape: Captured['shape'],
        handler: Captured['handler'],
      ) {
        if (name === 'list_shifts') throw new Error('duplicate tool name');
        calls.push({ name, description, shape, handler });
      },
    };
    const client = makeStubClient();

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerCatalogTools(server as any, client as any),
    ).resolves.toBeUndefined();

    // The first tool blew up; the second must still be registered.
    expect(calls.map((c) => c.name)).toEqual(['create_shift']);
  });
});
