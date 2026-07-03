import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrdioClient } from '../src/client.js';
import type { Config } from '../src/config.js';
import { OrdioApiError } from '../src/utils/errors.js';

const config: Config = {
  apiBaseUrl: 'https://api.example.com',
  apiKey: 'test-key',
  orgId: 'org_123',
  transport: 'stdio',
  port: 3100,
};

function mockFetchOnce(body: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? (ok ? 200 : 500);
  (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  } as Response);
}

describe('OrdioClient.getToolManifest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GETs the assistant tools endpoint with Bearer auth and returns the raw manifest', async () => {
    const manifest = {
      tools: [{ name: 'create_shift', description: 'Create a shift' }],
      version: '2026-07-03',
    };
    mockFetchOnce(manifest);
    const client = new OrdioClient(config);

    const result = await client.getToolManifest();

    // Returned verbatim — NOT unwrapped to `.data`
    expect(result).toEqual(manifest);
    expect(result.tools).toHaveLength(1);
    expect(result.version).toBe('2026-07-03');

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.com/api/v1/orgs/org_123/assistant/tools');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer test-key');
  });

  it('throws OrdioApiError when the manifest fetch returns 500', async () => {
    mockFetchOnce({ message: 'boom' }, { ok: false, status: 500 });
    const client = new OrdioClient(config);

    await expect(client.getToolManifest()).rejects.toBeInstanceOf(OrdioApiError);
  });
});

describe('OrdioClient.execTool', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs to the named tool endpoint with { args, confirmToken } and returns the raw result', async () => {
    const raw = { kind: 'confirm-required', preview: 'p', confirmToken: 'tok', args: { date: '2026-07-03' } };
    mockFetchOnce(raw);
    const client = new OrdioClient(config);

    const result = await client.execTool('create_shift', { date: '2026-07-03' }, 'tok');

    // Raw body returned, not unwrapped
    expect(result).toEqual(raw);
    expect(result.kind).toBe('confirm-required');

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.com/api/v1/orgs/org_123/assistant/tools/create_shift');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer test-key');
    expect(JSON.parse(init.body)).toEqual({ args: { date: '2026-07-03' }, confirmToken: 'tok' });
  });

  it('omits confirmToken from the body when not provided', async () => {
    mockFetchOnce({ kind: 'result', data: { id: '1' } });
    const client = new OrdioClient(config);

    const result = await client.execTool('list_shifts', {});

    expect(result.kind).toBe('result');
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ args: {} });
    expect(JSON.parse(init.body)).not.toHaveProperty('confirmToken');
  });

  it('throws OrdioApiError when exec returns 500', async () => {
    mockFetchOnce({ message: 'server error' }, { ok: false, status: 500 });
    const client = new OrdioClient(config);

    await expect(client.execTool('create_shift', {})).rejects.toBeInstanceOf(OrdioApiError);
  });
});
