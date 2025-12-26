/**
 * Field information extracted from JSON schema
 */
export interface SchemaField {
  name: string;
  description?: string;
  type?: string;
}

/**
 * Extracts field names and descriptions from a JSON schema
 * Handles various JSON schema structures
 */
export function extractFieldsFromSchema(schema: any): SchemaField[] {
  if (!schema || typeof schema !== 'object') {
    return [];
  }

  // Handle empty object
  if (Object.keys(schema).length === 0) {
    return [];
  }

  // Standard JSON Schema with properties
  if (schema.properties && typeof schema.properties === 'object') {
    const fields = Object.entries(schema.properties).map(([name, prop]: [string, any]) => {
      // Handle case where prop might be a string (description) or object
      if (typeof prop === 'string') {
        return {
          name,
          description: prop,
          type: '',
        };
      }
      return {
        name,
        description: prop?.description || prop?.title || '',
        type: prop?.type || '',
      };
    });
    if (fields.length > 0) return fields;
  }

  // If schema itself is an object with string keys (flat structure)
  // This handles: { "field1": "description1", "field2": "description2" }
  if (!schema.properties && !schema.type) {
    const fields: SchemaField[] = [];
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'string') {
        fields.push({
          name: key,
          description: value,
          type: '',
        });
      } else if (typeof value === 'object' && value !== null) {
        fields.push({
          name: key,
          description: (value as any)?.description || (value as any)?.title || '',
          type: (value as any)?.type || '',
        });
      }
    }
    if (fields.length > 0) return fields;
  }

  // If it's an array schema, check items
  if (schema.type === 'array' && schema.items?.properties) {
    return Object.entries(schema.items.properties).map(([name, prop]: [string, any]) => ({
      name,
      description: typeof prop === 'string' ? prop : (prop?.description || prop?.title || ''),
      type: typeof prop === 'string' ? '' : (prop?.type || ''),
    }));
  }

  // Try to find any object with properties nested
  function findProperties(obj: any, depth = 0): SchemaField[] {
    if (depth > 5) return []; // Prevent infinite recursion
    
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      // Check if this object has properties
      if (obj.properties && typeof obj.properties === 'object') {
        return Object.entries(obj.properties).map(([name, prop]: [string, any]) => {
          if (typeof prop === 'string') {
            return { name, description: prop, type: '' };
          }
          return {
            name,
            description: prop?.description || prop?.title || '',
            type: prop?.type || '',
          };
        });
      }
      
      // If object itself looks like a flat field map
      if (!obj.properties && !obj.type && Object.keys(obj).length > 0) {
        const fields: SchemaField[] = [];
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            fields.push({ name: key, description: value, type: '' });
          } else if (typeof value === 'object' && value !== null) {
            fields.push({
              name: key,
              description: (value as any)?.description || (value as any)?.title || '',
              type: (value as any)?.type || '',
            });
          }
        }
        if (fields.length > 0) return fields;
      }
      
      // Recursively search
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && key !== 'properties') {
          const found = findProperties(obj[key], depth + 1);
          if (found.length > 0) {
            return found;
          }
        }
      }
    }
    
    return [];
  }

  return findProperties(schema);
}

/**
 * Legacy function for backward compatibility - returns just field names
 */
export function extractFieldNamesFromSchema(schema: any): string[] {
  return extractFieldsFromSchema(schema).map(f => f.name);
}
