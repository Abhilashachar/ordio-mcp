import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig catalogProxy flag', () => {
  beforeEach(() => {
    // Required env so loadConfig() doesn't throw.
    vi.stubEnv('ORDIO_API_KEY', 'test-key');
    vi.stubEnv('ORDIO_ORG_ID', 'org_123');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to falsy when ORDIO_CATALOG_PROXY is unset', () => {
    vi.stubEnv('ORDIO_CATALOG_PROXY', undefined);
    expect(loadConfig().catalogProxy).toBeFalsy();
  });

  it('is true when ORDIO_CATALOG_PROXY=1', () => {
    vi.stubEnv('ORDIO_CATALOG_PROXY', '1');
    expect(loadConfig().catalogProxy).toBe(true);
  });

  it('is true when ORDIO_CATALOG_PROXY=true', () => {
    vi.stubEnv('ORDIO_CATALOG_PROXY', 'true');
    expect(loadConfig().catalogProxy).toBe(true);
  });

  it('is false when ORDIO_CATALOG_PROXY=0', () => {
    vi.stubEnv('ORDIO_CATALOG_PROXY', '0');
    expect(loadConfig().catalogProxy).toBe(false);
  });

  it('is false for any other value', () => {
    vi.stubEnv('ORDIO_CATALOG_PROXY', 'yes');
    expect(loadConfig().catalogProxy).toBe(false);
  });
});
