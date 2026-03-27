import { describe, it, expect } from 'vitest';
import { OrdioApiError, mcpError, mcpSuccess, buildApiError, withErrorHandling } from '../../src/utils/errors.js';

describe('mcpError', () => {
  it('returns error response with isError flag', () => {
    const result = mcpError('Something went wrong');
    expect(result.isError).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('Something went wrong');
  });
});

describe('mcpSuccess', () => {
  it('returns success response without isError', () => {
    const result = mcpSuccess('All good');
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe('All good');
  });
});

describe('buildApiError', () => {
  it('creates OrdioApiError with status and message', () => {
    const err = buildApiError(404, { message: 'Not found' });
    expect(err).toBeInstanceOf(OrdioApiError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.suggestion).toContain('not found');
  });

  it('provides suggestion for 401', () => {
    const err = buildApiError(401, { message: 'Unauthorized' });
    expect(err.suggestion).toContain('ORDIO_API_KEY');
  });

  it('provides suggestion for 429', () => {
    const err = buildApiError(429, { message: 'Too many requests' });
    expect(err.suggestion).toContain('Rate limited');
  });

  it('handles 500 errors', () => {
    const err = buildApiError(500, { message: 'Internal error' });
    expect(err.suggestion).toContain('Server error');
  });

  it('falls back to HTTP status when no message', () => {
    const err = buildApiError(400, {});
    expect(err.message).toBe('HTTP 400');
  });
});

describe('withErrorHandling', () => {
  it('passes through successful results', async () => {
    const result = await withErrorHandling(async () => mcpSuccess('works'));
    expect(result.content[0].text).toBe('works');
    expect(result.isError).toBeUndefined();
  });

  it('catches OrdioApiError and returns actionable mcpError', async () => {
    const result = await withErrorHandling(async () => {
      throw new OrdioApiError('Item not found', 404, undefined, 'Use list tool');
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Item not found');
    expect(result.content[0].text).toContain('Use list tool');
  });

  it('catches generic errors', async () => {
    const result = await withErrorHandling(async () => {
      throw new Error('network failure');
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('network failure');
  });
});
