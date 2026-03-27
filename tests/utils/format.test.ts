import { describe, it, expect } from 'vitest';
import { formatList, formatItem, formatMutation } from '../../src/utils/format.js';

describe('formatList', () => {
  it('returns count with empty array', () => {
    const result = formatList([]);
    expect(result.content[0].text).toContain('Found 0 items');
  });

  it('returns count with items', () => {
    const items = [{ name: 'A' }, { name: 'B' }];
    const result = formatList(items, { label: 'things' });
    expect(result.content[0].text).toContain('Found 2 things');
  });

  it('includes custom summary', () => {
    const result = formatList([{ id: 1 }], { summary: 'All good!' });
    expect(result.content[0].text).toContain('All good!');
  });

  it('truncates large arrays', () => {
    const items = Array.from({ length: 75 }, (_, i) => ({ id: i }));
    const result = formatList(items);
    expect(result.content[0].text).toContain('Found 75 items');
    expect(result.content[0].text).toContain('and 25 more');
  });

  it('handles non-array data', () => {
    const result = formatList('not an array');
    expect(result.content[0].text).toContain('Found 0 items');
  });
});

describe('formatItem', () => {
  it('returns item with key fields', () => {
    const item = { name: 'Chicken', quantity: 10, unit: 'lbs', status: 'active' };
    const result = formatItem(item);
    expect(result.content[0].text).toContain('Chicken');
  });

  it('handles null data', () => {
    const result = formatItem(null);
    expect(result.content[0].text).toBe('No data returned.');
  });

  it('uses custom label when key fields exist', () => {
    const result = formatItem({ id: '123', name: 'Test' }, 'My item');
    expect(result.content[0].text).toContain('My item');
  });
});

describe('formatMutation', () => {
  it('formats create with name', () => {
    const result = formatMutation({ name: 'New Item' }, 'Created');
    expect(result.content[0].text).toContain('Created "New Item" successfully');
  });

  it('formats delete without full data', () => {
    const result = formatMutation(null, 'Deleted');
    expect(result.content[0].text).toContain('Deleted successfully');
  });

  it('formats update with title fallback', () => {
    const result = formatMutation({ title: 'My Task' }, 'Updated');
    expect(result.content[0].text).toContain('Updated "My Task" successfully');
  });
});
