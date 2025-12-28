import SwaggerParser from 'swagger-parser';
import { APIFormData, HTTPMethod } from '@/lib/types/api';

// Type declaration for swagger-parser v10 API
interface SwaggerParserType {
  dereference(url: string): Promise<any>;
}

const parser = SwaggerParser as unknown as SwaggerParserType;

interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths?: Record<string, Record<string, any>>;
}

interface ParsedEndpoint {
  path: string;
  method: string;
  operation: any;
}

/**
 * Converts OpenAPI HTTP method to our HTTPMethod type
 */
function normalizeMethod(method: string): HTTPMethod {
  const upperMethod = method.toUpperCase();
  const validMethods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  return validMethods.includes(upperMethod as HTTPMethod) ? (upperMethod as HTTPMethod) : 'GET';
}

/**
 * Extracts path parameters from OpenAPI path template
 * e.g., /users/{id} -> [{ name: 'id', value: '' }]
 */
function extractPathParams(path: string): Array<{ name: string; value: string }> {
  const params: Array<{ name: string; value: string }> = [];
  const paramRegex = /\{([^}]+)\}/g;
  let match;

  while ((match = paramRegex.exec(path)) !== null) {
    params.push({ name: match[1], value: '' });
  }

  return params;
}

/**
 * Converts OpenAPI parameter to KeyValuePair format
 */
function convertParameters(parameters: any[] = []): Array<{ name: string; value: string }> {
  return parameters
    .filter((param) => param.in === 'query' || param.in === 'header' || param.in === 'cookie')
    .map((param) => ({
      name: param.name || '',
      value: param.default || param.example || '',
    }));
}

/**
 * Converts OpenAPI schema to JSON schema format for payload_schema
 */
function convertSchemaToJSONSchema(schema: any): Record<string, any> | null {
  if (!schema) return null;

  // If it's already a JSON schema-like structure, return it
  if (schema.type || schema.properties || schema.items) {
    return {
      type: schema.type || 'object',
      properties: schema.properties || {},
      required: schema.required || [],
      ...(schema.items && { items: schema.items }),
    };
  }

  // Try to extract request body schema
  if (schema.content && schema.content['application/json']) {
    return convertSchemaToJSONSchema(schema.content['application/json'].schema);
  }

  return null;
}

/**
 * Builds the full URL from base URL and path
 */
function buildURL(baseURL: string, path: string): string {
  if (!baseURL) {
    // If no base URL, return the path as-is
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Remove trailing slash from baseURL and leading slash from path
  const cleanBase = baseURL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Parses OpenAPI spec and converts it to APIFormData array
 */
export async function parseOpenAPIToAPIs(openAPIUrl: string): Promise<APIFormData[]> {
  try {
    // Fetch and parse the OpenAPI spec
    const api = await parser.dereference(openAPIUrl);
    const spec = api as OpenAPISpec;

    if (!spec.paths) {
      throw new Error('No paths found in OpenAPI specification');
    }

    // Get base URL from servers array or default to empty
    const baseURL = spec.servers && spec.servers.length > 0 
      ? spec.servers[0].url 
      : '';

    const apiFormDataList: APIFormData[] = [];
    const methodOrder: Record<string, number> = {
      GET: 1,
      POST: 2,
      PUT: 3,
      PATCH: 4,
      DELETE: 5,
    };

    // Extract all endpoints
    const endpoints: ParsedEndpoint[] = [];
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
          endpoints.push({ path, method, operation });
        }
      }
    }

    // Sort endpoints by path and method
    endpoints.sort((a, b) => {
      const pathCompare = a.path.localeCompare(b.path);
      if (pathCompare !== 0) return pathCompare;
      const aOrder = methodOrder[a.method.toUpperCase()] || 99;
      const bOrder = methodOrder[b.method.toUpperCase()] || 99;
      return aOrder - bOrder;
    });

    // Convert each endpoint to APIFormData
    for (const { path, method, operation } of endpoints) {
      const normalizedMethod = normalizeMethod(method);
      const fullURL = baseURL ? buildURL(baseURL, path) : path;

      // Extract path parameters
      const pathParams = extractPathParams(path);

      // Extract query, header, and cookie parameters
      const parameters = operation.parameters || [];
      const queryParams = convertParameters(parameters.filter((p: any) => p.in === 'query'));
      const headers = convertParameters(parameters.filter((p: any) => p.in === 'header'));
      const cookies = convertParameters(parameters.filter((p: any) => p.in === 'cookie'));

      // Extract request body schema
      let payloadSchema: Record<string, any> | null = null;
      if (operation.requestBody) {
        payloadSchema = convertSchemaToJSONSchema(operation.requestBody);
      }

      // Generate API name from operationId, summary, or path+method
      let apiName = operation.operationId || 
                   operation.summary || 
                   `${normalizedMethod} ${path}`;

      // Clean up the name - ensure it's not empty
      apiName = apiName.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || `${normalizedMethod} ${path}`;
      
      // Limit name length
      if (apiName.length > 100) {
        apiName = apiName.substring(0, 97) + '...';
      }

      // Generate description
      const description = operation.description || 
                        operation.summary || 
                        `${normalizedMethod} ${path}`;

      const apiFormData: APIFormData = {
        name: apiName,
        description: description.substring(0, 500), // Limit description length
        method: normalizedMethod,
        url: fullURL,
        headers: headers,
        cookies: cookies,
        url_params: [...pathParams, ...queryParams],
        payload_schema: payloadSchema,
        is_enabled: true,
      };

      apiFormDataList.push(apiFormData);
    }

    return apiFormDataList;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse OpenAPI specification: ${error.message}`);
    }
    throw new Error('Failed to parse OpenAPI specification: Unknown error');
  }
}
