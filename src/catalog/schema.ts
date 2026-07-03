/**
 * Convert a JSON-Schema `parameters` object (as served by the ordio assistant
 * tool manifest) into a Zod "raw shape" — the `{ key: ZodType }` record that
 * `server.tool(name, desc, shape, handler)` expects.
 *
 * The manifest uses lowercase JSON-Schema type strings
 * (`string | number | integer | boolean | array | object`). Anything this
 * converter does not understand degrades to `z.any()` so registration can
 * NEVER throw on an unexpected shape.
 */

import { z } from 'zod';
import type { ZodRawShape, ZodTypeAny } from 'zod';

export interface JsonSchemaProperty {
  type?: string;
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface JsonSchemaObject {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

/** Map a single JSON-Schema property to its Zod base type (no optional/describe). */
function baseSchemaFor(prop: JsonSchemaProperty): ZodTypeAny {
  switch (prop.type) {
    case 'string':
      if (Array.isArray(prop.enum) && prop.enum.length > 0) {
        // The tuple cast is required for z.enum's type signature.
        return z.enum(prop.enum as [string, ...string[]]);
      }
      return z.string();
    case 'number':
    case 'integer':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'array': {
      const itemType = prop.items?.type;
      if (itemType === 'string') return z.array(z.string());
      if (itemType === 'number' || itemType === 'integer') return z.array(z.number());
      if (itemType === 'boolean') return z.array(z.boolean());
      return z.any();
    }
    default:
      return z.any();
  }
}

export function parametersToZodShape(parameters?: JsonSchemaObject): ZodRawShape {
  const properties = parameters?.properties;
  if (!properties) return {};

  const required = new Set(parameters?.required ?? []);
  const shape: ZodRawShape = {};

  for (const [name, prop] of Object.entries(properties)) {
    let schema: ZodTypeAny;
    try {
      schema = baseSchemaFor(prop ?? {});
    } catch {
      // Never let a malformed property break registration.
      schema = z.any();
    }
    if (!required.has(name)) schema = schema.optional();
    if (prop?.description) schema = schema.describe(prop.description);
    shape[name] = schema;
  }

  return shape;
}
