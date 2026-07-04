import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parametersToZodShape } from '../../src/catalog/schema.js';

describe('parametersToZodShape', () => {
  it('maps string -> z.string()', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    });
    expect(shape.name).toBeInstanceOf(z.ZodType);
    expect(shape.name.safeParse('hello').success).toBe(true);
    expect(shape.name.safeParse(42).success).toBe(false);
  });

  it('maps number and integer -> z.number()', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { count: { type: 'number' }, age: { type: 'integer' } },
      required: ['count', 'age'],
    });
    expect(shape.count.safeParse(3.14).success).toBe(true);
    expect(shape.count.safeParse('nope').success).toBe(false);
    expect(shape.age.safeParse(30).success).toBe(true);
    expect(shape.age.safeParse('nope').success).toBe(false);
  });

  it('maps boolean -> z.boolean()', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { flag: { type: 'boolean' } },
      required: ['flag'],
    });
    expect(shape.flag.safeParse(true).success).toBe(true);
    expect(shape.flag.safeParse('true').success).toBe(false);
  });

  it('maps array of string -> z.array(z.string())', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { stationIds: { type: 'array', items: { type: 'string' } } },
      required: ['stationIds'],
    });
    expect(shape.stationIds.safeParse(['a', 'b']).success).toBe(true);
    expect(shape.stationIds.safeParse([1, 2]).success).toBe(false);
    expect(shape.stationIds.safeParse('a').success).toBe(false);
  });

  it('leaves required props non-optional', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    });
    expect(shape.name.isOptional()).toBe(false);
    expect(shape.name.safeParse(undefined).success).toBe(false);
  });

  it('makes non-required props optional', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { notes: { type: 'string' } },
      required: [],
    });
    expect(shape.notes.isOptional()).toBe(true);
    expect(shape.notes.safeParse(undefined).success).toBe(true);
  });

  it('makes props optional when required array is absent', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { notes: { type: 'string' } },
    });
    expect(shape.notes.isOptional()).toBe(true);
  });

  it('applies description via .describe()', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { date: { type: 'string', description: 'YYYY-MM-DD' } },
      required: ['date'],
    });
    expect(shape.date.description).toBe('YYYY-MM-DD');
  });

  it('keeps description on optional props too', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { note: { type: 'string', description: 'a note' } },
      required: [],
    });
    expect(shape.note.description).toBe('a note');
    expect(shape.note.isOptional()).toBe(true);
  });

  it('maps string with enum -> z.enum([...])', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: { status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] } },
      required: ['status'],
    });
    expect(shape.status.safeParse('scheduled').success).toBe(true);
    expect(shape.status.safeParse('nonsense').success).toBe(false);
  });

  it('returns {} when parameters is undefined', () => {
    expect(parametersToZodShape()).toEqual({});
    expect(parametersToZodShape(undefined)).toEqual({});
  });

  it('returns {} when parameters has no properties', () => {
    expect(parametersToZodShape({ type: 'object' })).toEqual({});
  });

  it('falls back to z.any() for unknown/complex types without throwing', () => {
    const shape = parametersToZodShape({
      type: 'object',
      properties: {
        nested: { type: 'object', properties: { a: { type: 'string' } } },
        objList: { type: 'array', items: { type: 'object' } },
        weird: { type: 'somethingElse' },
      },
      required: ['nested'],
    });
    // Accepts anything, never throws
    expect(shape.nested.safeParse({ a: 'x' }).success).toBe(true);
    expect(shape.nested.safeParse('whatever').success).toBe(true);
    expect(shape.objList.safeParse([{ a: 1 }]).success).toBe(true);
    expect(shape.weird.safeParse(123).success).toBe(true);
  });

  it('never throws for a malformed enum (empty array)', () => {
    expect(() =>
      parametersToZodShape({
        type: 'object',
        properties: { status: { type: 'string', enum: [] } },
      }),
    ).not.toThrow();
  });
});
