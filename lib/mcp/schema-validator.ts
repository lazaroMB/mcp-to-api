/**
 * Validates and normalizes input schemas to ensure MCP protocol compliance
 */

export interface SchemaValidationResult {
  valid: boolean;
  normalized: any;
  errors: string[];
}

/**
 * Validates and normalizes an input schema to ensure it's MCP protocol compliant
 * Handles both full JSON Schema format and simplified format like { "x": "number" }
 */
export function validateAndNormalizeInputSchema(schema: any): SchemaValidationResult {
  const errors: string[] = [];
  let normalized: any = {};

  // If schema is null, undefined, or not an object, create default
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    normalized = {
      type: 'object',
      properties: {},
    };
    if (schema !== null && schema !== undefined) {
      errors.push('Input schema must be an object');
    }
    return { valid: true, normalized, errors };
  }

  // Check if this is a simplified format: { "fieldName": "type" } or { "fieldName": "description" }
  const keys = Object.keys(schema);
  const isSimplifiedFormat = keys.length > 0 && 
    keys.every(key => {
      const value = schema[key];
      // Check if value is a string (could be type or description)
      return typeof value === 'string';
    }) &&
    // Not already a JSON Schema structure
    !schema.type &&
    !schema.properties;

  if (isSimplifiedFormat) {
    // Convert simplified format to full JSON Schema
    normalized = {
      type: 'object',
      properties: {},
    };

    for (const [fieldName, value] of Object.entries(schema)) {
      const valueStr = value as string;
      // Check if it's a type or description
      const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
      
      if (validTypes.includes(valueStr.toLowerCase())) {
        // It's a type
        normalized.properties[fieldName] = {
          type: valueStr.toLowerCase(),
          description: `${fieldName} parameter`,
        };
      } else {
        // It's a description, default to string type
        normalized.properties[fieldName] = {
          type: 'string',
          description: valueStr,
        };
      }
    }

    return { valid: true, normalized, errors: [] };
  }

  // Ensure type is "object"
  normalized = {
    type: 'object',
    ...schema,
    type: 'object', // Force type to be "object"
  };

  // Ensure properties exists and is an object
  if (!normalized.properties || typeof normalized.properties !== 'object' || Array.isArray(normalized.properties)) {
    normalized.properties = {};
    if (schema.properties !== undefined) {
      errors.push('Properties must be an object');
    }
  }

  // Validate required array if present
  if (normalized.required !== undefined) {
    if (!Array.isArray(normalized.required)) {
      errors.push('Required must be an array');
      normalized.required = [];
    } else {
      // Ensure all required fields exist in properties
      const propertyKeys = Object.keys(normalized.properties);
      const invalidRequired = normalized.required.filter(
        (field: string) => !propertyKeys.includes(field)
      );
      if (invalidRequired.length > 0) {
        errors.push(
          `Required fields not in properties: ${invalidRequired.join(', ')}`
        );
      }
    }
  }

  // Validate each property
  for (const [key, prop] of Object.entries(normalized.properties)) {
    if (typeof prop !== 'object' || prop === null || Array.isArray(prop)) {
      errors.push(`Property "${key}" must be an object`);
      continue;
    }

    const property = prop as any;

    // Ensure property has a type
    if (!property.type) {
      errors.push(`Property "${key}" must have a type`);
      normalized.properties[key] = {
        type: 'string', // Default type
        ...property,
      };
    }

    // Validate property type
    const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
    if (!validTypes.includes(property.type)) {
      errors.push(
        `Property "${key}" has invalid type "${property.type}". Must be one of: ${validTypes.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    normalized,
    errors,
  };
}
