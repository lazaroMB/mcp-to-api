import { MappingConfig, FieldMapping } from '@/lib/types/mapping';

/**
 * Safely evaluates a JavaScript expression
 * WARNING: In production, use a proper sandboxed evaluator
 */
function evaluateExpression(expression: string, value: any): any {
  try {
    // Simple expression evaluation - in production, use a sandboxed solution
    // This is a basic implementation for demonstration
    const func = new Function('value', `return ${expression}`);
    return func(value);
  } catch (error) {
    throw new Error(`Expression evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transforms tool arguments to API payload using mapping configuration
 */
export function transformToolArgsToAPIPayload(
  toolArgs: Record<string, any>,
  mappingConfig: MappingConfig
): Record<string, any> {
  const payload: Record<string, any> = {};

  // Apply field mappings
  for (const mapping of mappingConfig.field_mappings) {
    if (!mapping.api_field) continue;

    if (mapping.transformation === 'direct') {
      // Direct mapping: pass value as-is
      if (mapping.tool_field && toolArgs[mapping.tool_field] !== undefined) {
        payload[mapping.api_field] = toolArgs[mapping.tool_field];
      }
    } else if (mapping.transformation === 'constant') {
      // Constant: use fixed value
      payload[mapping.api_field] = mapping.value || '';
    } else if (mapping.transformation === 'expression') {
      // Expression: evaluate JavaScript expression
      if (mapping.tool_field && toolArgs[mapping.tool_field] !== undefined) {
        try {
          payload[mapping.api_field] = evaluateExpression(
            mapping.expression || 'value',
            toolArgs[mapping.tool_field]
          );
        } catch (error) {
          throw new Error(
            `Failed to evaluate expression for field ${mapping.api_field}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    }
  }

  // Add static fields
  if (mappingConfig.static_fields) {
    Object.assign(payload, mappingConfig.static_fields);
  }

  return payload;
}
