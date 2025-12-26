# MCP Handler Implementation Plan

## Overview
Create an MCP handler that receives an MCP slug and serves as an independent MCP server, returning resources, handling tool invocations, and following the MCP protocol.

## Architecture

### 1. API Route Structure
```
/api/mcp/[slug]/...
```

### 2. MCP Protocol Endpoints

#### 2.1 Initialize (MCP Protocol)
- **Route**: `POST /api/mcp/[slug]/initialize`
- **Purpose**: Initialize the MCP server connection
- **Returns**: Server capabilities, protocol version, etc.

#### 2.2 List Tools
- **Route**: `GET /api/mcp/[slug]/tools` or `POST /api/mcp/[slug]/tools/list`
- **Purpose**: Return all tools for the MCP
- **Returns**: Array of tool definitions with name, description, inputSchema

#### 2.3 Call Tool
- **Route**: `POST /api/mcp/[slug]/tools/call`
- **Purpose**: Execute a tool invocation
- **Process**:
  1. Receive tool name and arguments
  2. Look up tool in database
  3. Find API mapping for the tool
  4. Transform tool arguments to API payload using mapping config
  5. Call the mapped API with headers, cookies, URL params
  6. Return API response

#### 2.4 List Resources
- **Route**: `GET /api/mcp/[slug]/resources` or `POST /api/mcp/[slug]/resources/list`
- **Purpose**: Return all resources for the MCP
- **Returns**: Array of resource definitions with URI, name, description, mimeType

#### 2.5 Read Resource
- **Route**: `POST /api/mcp/[slug]/resources/read`
- **Purpose**: Read a specific resource
- **Process**:
  1. Receive resource URI
  2. Look up resource in database
  3. Return resource metadata (actual resource fetching depends on implementation)

## Implementation Steps

### Step 1: Database Queries
- Create server actions to fetch MCP by slug
- Fetch tools, resources, and mappings for an MCP
- Optimize queries with joins

### Step 2: MCP Protocol Types
- Define TypeScript interfaces for MCP protocol messages
- Request/Response types for each endpoint

### Step 3: API Route Handlers
- Create route handlers for each MCP endpoint
- Implement error handling
- Add validation

### Step 4: Tool Invocation Handler
- Implement mapping transformation logic
- Handle direct, constant, and expression transformations
- Make HTTP requests to mapped APIs
- Handle API responses and errors

### Step 5: Resource Handler
- Return resource list
- Handle resource reading (if needed)

### Step 6: Testing & Documentation
- Test with MCP clients
- Document API endpoints
- Add examples

## Technical Details

### Tool Invocation Flow
1. Client sends: `{ name: "tool_name", arguments: { ... } }`
2. Handler:
   - Looks up tool by name in MCP
   - Gets tool's API mapping
   - Transforms arguments using field mappings:
     - Direct: `apiField = toolArguments[toolField]`
     - Constant: `apiField = mapping.value`
     - Expression: Evaluate JavaScript expression
   - Builds API request:
     - URL with params
     - Headers
     - Cookies
     - Payload (for POST/PUT/PATCH)
   - Makes HTTP request
   - Returns response

### Mapping Transformation
```typescript
function transformToolArgsToAPIPayload(
  toolArgs: Record<string, any>,
  mapping: MappingConfig
): Record<string, any> {
  const payload: Record<string, any> = {};
  
  // Apply field mappings
  for (const mapping of mappingConfig.field_mappings) {
    if (mapping.transformation === 'direct') {
      payload[mapping.api_field] = toolArgs[mapping.tool_field];
    } else if (mapping.transformation === 'constant') {
      payload[mapping.api_field] = mapping.value;
    } else if (mapping.transformation === 'expression') {
      // Evaluate expression (needs safe evaluation)
      payload[mapping.api_field] = evaluateExpression(
        mapping.expression,
        toolArgs[mapping.tool_field]
      );
    }
  }
  
  // Add static fields
  Object.assign(payload, mappingConfig.static_fields || {});
  
  return payload;
}
```

### API Request Builder
```typescript
async function callMappedAPI(
  api: API,
  payload: Record<string, any>
): Promise<any> {
  // Build URL with params
  let url = api.url;
  if (api.url_params.length > 0) {
    const params = new URLSearchParams();
    api.url_params.forEach(param => {
      params.append(param.name, param.value);
    });
    url += '?' + params.toString();
  }
  
  // Build headers
  const headers: Record<string, string> = {};
  api.headers.forEach(header => {
    headers[header.name] = header.value;
  });
  
  // Build cookies
  const cookieHeader = api.cookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }
  
  // Make request
  const response = await fetch(url, {
    method: api.method,
    headers,
    body: ['POST', 'PUT', 'PATCH'].includes(api.method)
      ? JSON.stringify(payload)
      : undefined,
  });
  
  return response.json();
}
```

## Security Considerations
- Validate MCP slug exists
- Sanitize tool arguments
- Safe expression evaluation (sandboxed)
- Rate limiting
- Authentication/Authorization (if needed)

## File Structure
```
app/
  api/
    mcp/
      [slug]/
        route.ts (initialize)
        tools/
          route.ts (list)
          call/
            route.ts (call tool)
        resources/
          route.ts (list)
          read/
            route.ts (read resource)
lib/
  mcp/
    protocol.ts (MCP protocol types)
    handler.ts (MCP handler logic)
    transformer.ts (mapping transformation)
    api-client.ts (API request builder)
```
