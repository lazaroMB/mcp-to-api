import { API } from '@/lib/types/api';
import { MCPToolFormData } from '@/lib/types/mcp';
import { MappingConfig, FieldMapping } from '@/lib/types/mapping';
import { extractFieldsFromSchema } from './schema-fields';
import { validateAndNormalizeInputSchema } from '@/lib/mcp/schema-validator';

/**
 * Extracts variable names from URL parameter values
 * Handles patterns like {varName}, {{varName}}, etc.
 */
function extractVariablesFromValue(value: string): string[] {
  const variables: string[] = [];
  // Match {variableName} or {{variableName}} patterns
  const regex = /\{+([a-zA-Z_][a-zA-Z0-9_]*)\}+/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    const varName = match[1];
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  return variables;
}

/**
 * Generates a tool input schema from an API's payload schema
 * If no payload schema exists, creates one from URL parameters
 * Creates a one-to-one mapping where tool fields match API fields
 */
export function generateToolInputSchemaFromAPI(api: API): Record<string, any> {
  // If no payload schema, try to create one from URL parameters
  if (!api.payload_schema) {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    // Extract variables from URL itself (e.g., /users/{userId})
    const urlVariables = extractVariablesFromValue(api.url);
    for (const varName of urlVariables) {
      if (!properties[varName]) {
        properties[varName] = {
          type: 'string',
          description: `${varName} parameter from URL path`,
        };
        required.push(varName);
      }
    }
    
    // Extract variables from URL parameters
    if (api.url_params && api.url_params.length > 0) {
      for (const param of api.url_params) {
        if (param.name) {
          const paramName = param.name.trim();
          const paramValue = (param.value || '').trim();
          
          if (!paramName) continue;
          
          // Extract variables from parameter value (e.g., {userId})
          const valueVariables = extractVariablesFromValue(paramValue);
          
          if (valueVariables.length > 0) {
            // Parameter value contains variables - create fields for each variable
            // The variable names in the value are what we want in the payload
            for (const varName of valueVariables) {
              if (!properties[varName]) {
                properties[varName] = {
                  type: 'string',
                  description: `${varName} parameter (used in ${paramName} URL parameter)`,
                };
                required.push(varName);
              }
            }
          } else if (paramValue) {
            // Parameter has a static value - still create a field using the parameter name
            // This allows the user to override the static value if needed
            if (!properties[paramName]) {
              properties[paramName] = {
                type: 'string',
                description: `${paramName} URL parameter (default: ${paramValue})`,
              };
              // Don't make it required if it has a static default value
              // required.push(paramName);
            }
          } else {
            // Parameter name exists but no value - create field for the parameter name
            // This is the case where the param value will come from the payload
            if (!properties[paramName]) {
              properties[paramName] = {
                type: 'string',
                description: `${paramName} URL parameter`,
              };
              required.push(paramName);
            }
          }
        }
      }
    }
    
    // If we found any properties, return the schema
    if (Object.keys(properties).length > 0) {
      return {
        type: 'object',
        properties,
        required,
      };
    }
    
    // No parameters found, return empty schema
    return {
      type: 'object',
      properties: {},
      required: [],
    };
  }

  const schema = api.payload_schema;

  // Handle string JSON (might be stored as string in database)
  let parsedSchema = schema;
  if (typeof schema === 'string') {
    try {
      parsedSchema = JSON.parse(schema);
    } catch (e) {
      // If parsing fails, return empty schema
      return {
        type: 'object',
        properties: {},
        required: [],
      };
    }
  }

  // Early check: if schema is already a valid JSON Schema with properties that have content
  if (parsedSchema && typeof parsedSchema === 'object' && !Array.isArray(parsedSchema)) {
    // Check if it's a standard JSON Schema with properties
    if (parsedSchema.type === 'object' && parsedSchema.properties && typeof parsedSchema.properties === 'object') {
      const propertyKeys = Object.keys(parsedSchema.properties);
      if (propertyKeys.length > 0) {
        return {
          type: 'object',
          properties: parsedSchema.properties,
          required: parsedSchema.required && Array.isArray(parsedSchema.required) 
            ? parsedSchema.required.filter((f: string) => propertyKeys.includes(f))
            : propertyKeys,
        };
      }
    }
    
    // Check if it's a flat object structure without type/properties (simplified format)
    // e.g., { "field1": "string", "field2": "number" } or { "field1": "description" }
    if (!parsedSchema.type && !parsedSchema.properties) {
      const keys = Object.keys(parsedSchema);
      if (keys.length > 0) {
        // Check if all values are strings (simplified format)
        const allStrings = keys.every(key => typeof parsedSchema[key] === 'string');
        if (allStrings) {
          const properties: Record<string, any> = {};
          const required: string[] = [];
          const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
          
          for (const key of keys) {
            const value = parsedSchema[key] as string;
            if (validTypes.includes(value.toLowerCase())) {
              properties[key] = {
                type: value.toLowerCase(),
                description: `${key} parameter`,
              };
            } else {
              properties[key] = {
                type: 'string',
                description: value,
              };
            }
            required.push(key);
          }
          
          return {
            type: 'object',
            properties,
            required,
          };
        }
        
        // Check if values are objects (nested structure)
        const allObjects = keys.every(key => 
          typeof parsedSchema[key] === 'object' && 
          parsedSchema[key] !== null && 
          !Array.isArray(parsedSchema[key])
        );
        if (allObjects) {
          const properties: Record<string, any> = {};
          const required: string[] = [];
          
          for (const key of keys) {
            const value = parsedSchema[key] as any;
            properties[key] = {
              type: value.type || 'string',
              description: value.description || value.title || `${key} parameter`,
              ...(value.enum && { enum: value.enum }),
              ...(value.format && { format: value.format }),
            };
            if (value.required !== false) {
              required.push(key);
            }
          }
          
          return {
            type: 'object',
            properties,
            required,
          };
        }
      }
    }
  }

  // Use the schema validator to normalize the schema (handles simplified formats)
  const validation = validateAndNormalizeInputSchema(parsedSchema);
  const normalized = validation.normalized;

  // Check if we have properties after normalization
  if (normalized.properties && typeof normalized.properties === 'object') {
    const propertyKeys = Object.keys(normalized.properties);
    
    if (propertyKeys.length > 0) {
      // We have properties, use the normalized schema
      let required: string[] = [];
      
      if (normalized.required && Array.isArray(normalized.required)) {
        // Filter to only include fields that actually exist in properties
        required = normalized.required.filter((field: string) => propertyKeys.includes(field));
      }
      
      // If no valid required fields, make all properties required by default
      if (required.length === 0) {
        required = propertyKeys;
      }

      return {
        type: 'object',
        properties: normalized.properties,
        required,
      };
    }
  }

  // If normalized schema has no properties, try extracting fields using extractFieldsFromSchema
  const apiFields = extractFieldsFromSchema(parsedSchema);

  if (apiFields.length > 0) {
    // Build tool input schema matching API fields
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of apiFields) {
      properties[field.name] = {
        type: field.type || 'string',
        description: field.description || `${field.name} parameter`,
      };
      required.push(field.name);
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  // Last resort: return empty schema
  // This means the API doesn't have a valid payload schema defined
  return {
    type: 'object',
    properties: {},
    required: [],
  };
}

/**
 * Generates default one-to-one field mappings from tool input schema to API payload schema
 */
export function generateDefaultMappings(
  toolInputSchema: Record<string, any>,
  apiPayloadSchema: Record<string, any>
): FieldMapping[] {
  const toolFields = extractFieldsFromSchema(toolInputSchema);
  const apiFields = extractFieldsFromSchema(apiPayloadSchema);

  if (toolFields.length === 0 || apiFields.length === 0) {
    return [];
  }

  const mappings: FieldMapping[] = [];

  // Create one-to-one mappings for fields with matching names
  const apiFieldNames = new Set(apiFields.map(f => f.name));

  for (const toolField of toolFields) {
    // Try exact match first
    if (apiFieldNames.has(toolField.name)) {
      mappings.push({
        tool_field: toolField.name,
        api_field: toolField.name,
        transformation: 'direct',
      });
    } else {
      // Try case-insensitive match
      const matchingApiField = apiFields.find(
        f => f.name.toLowerCase() === toolField.name.toLowerCase()
      );
      if (matchingApiField) {
        mappings.push({
          tool_field: toolField.name,
          api_field: matchingApiField.name,
          transformation: 'direct',
        });
      }
    }
  }

  return mappings;
}

/**
 * Creates a tool form data from an API
 */
export function createToolFromAPI(api: API): MCPToolFormData {
  const inputSchema = generateToolInputSchemaFromAPI(api);
  
  // Generate tool name from API name (sanitize for tool naming)
  const toolName = api.name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return {
    name: toolName,
    description: api.description || `Tool for ${api.method} ${api.name}`,
    input_schema: inputSchema,
    uri: `tool://${toolName}`,
    is_enabled: api.is_enabled,
  };
}

/**
 * Creates a mapping config from tool and API schemas
 * If API has no payload schema, creates mappings from URL parameters
 */
export function createMappingConfigFromAPITool(
  toolInputSchema: Record<string, any>,
  api: API
): MappingConfig {
  const mappings: FieldMapping[] = [];
  
  // If API has a payload schema, use standard field mappings
  if (api.payload_schema) {
    const defaultMappings = generateDefaultMappings(toolInputSchema, api.payload_schema);
    mappings.push(...defaultMappings);
  } else {
    // No payload schema - create mappings from URL parameters
    const toolFields = extractFieldsFromSchema(toolInputSchema);
    
    // Extract variables from URL path
    const urlVariables = extractVariablesFromValue(api.url);
    for (const varName of urlVariables) {
      const toolField = toolFields.find(f => f.name === varName);
      if (toolField) {
        // For URL path variables, we map directly (they'll be used in URL replacement)
        // Note: URL path variables are handled by the transformer, not through field mappings
        // But we can still create a mapping for consistency
        mappings.push({
          tool_field: varName,
          api_field: varName, // URL variables don't map to payload fields, but we keep the mapping
          transformation: 'direct',
        });
      }
    }
    
    // Create mappings for URL parameters
    if (api.url_params && api.url_params.length > 0) {
      for (const param of api.url_params) {
        if (param.name) {
          const paramName = param.name.trim();
          const paramValue = (param.value || '').trim();
          
          // Extract variables from parameter value
          const valueVariables = extractVariablesFromValue(paramValue);
          
          if (valueVariables.length > 0) {
            // Parameter value contains variables - map tool fields to those variables
            for (const varName of valueVariables) {
              const toolField = toolFields.find(f => f.name === varName);
              if (toolField) {
                // Map tool field to the URL parameter
                // The transformer will use this to replace {varName} in the param value
                mappings.push({
                  tool_field: varName,
                  api_field: paramName, // Map to the URL parameter name
                  transformation: 'direct',
                });
              }
            }
          } else if (!paramValue) {
            // Parameter name exists but no value - map tool field with same name
            const toolField = toolFields.find(f => f.name === paramName);
            if (toolField) {
              mappings.push({
                tool_field: paramName,
                api_field: paramName,
                transformation: 'direct',
              });
            }
          }
        }
      }
    }
  }

  return {
    field_mappings: mappings,
  };
}
