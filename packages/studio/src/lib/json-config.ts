export function parseJsonValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }
  return JSON.parse(trimmed);
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toJsonSchema(schema: unknown): Record<string, unknown> {
  if (isJsonObject(schema)) {
    return schema;
  }
  return {
    type: "object",
    properties: {},
    additionalProperties: true,
  };
}

/** Parse JSON string into an object for RJSF `formData`; invalid or non-objects become `{}`. */
export function safeObjectFormData(raw: string): Record<string, unknown> {
  try {
    const value = parseJsonValue(raw);
    return isJsonObject(value) ? value : {};
  } catch {
    return {};
  }
}
