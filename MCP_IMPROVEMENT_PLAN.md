# MCP Handler Improvement Plan

## Overview
Transform the current MCP handler into a fully compliant, dynamic MCP server that acts as an API proxy, automatically configuring itself based on database settings.

## Current Issues & Improvements Needed

### 1. MCP Protocol Compliance

#### Issues:
- Input schema validation might not match MCP spec exactly
- Missing support for some MCP protocol features
- Response format might need adjustments

#### Improvements:
- **Strict JSON Schema validation** for input schemas
- **Protocol version negotiation** during initialize
- **Capabilities negotiation** - advertise what we support
- **Error codes** - use proper MCP error codes
- **Request/Response format** - ensure 100% JSON-RPC 2.0 compliance

### 2. Dynamic Server Configuration

#### Current State:
- Server capabilities are hardcoded
- No runtime configuration changes

#### Improvements:
- **Dynamic capabilities** based on what's configured:
  - If tools exist → advertise tools capability
  - If resources exist → advertise resources capability
  - If prompts exist → advertise prompts capability (future)
- **Runtime configuration reload** - detect changes without restart
- **Server info** from database (name, version from MCP record)

### 3. API Proxy Enhancements

#### Current State:
- Basic API calling works
- Limited error handling
- No request/response transformation beyond field mapping

#### Improvements:
- **Request transformation pipeline**:
  - Field mapping (current)
  - Value transformation (expressions)
  - Header injection
  - URL parameter injection
  - Query string building
- **Response transformation**:
  - Extract specific fields from API response
  - Transform response format
  - Error handling and retries
- **API response caching** (optional)
- **Rate limiting** per API
- **Request/response logging** for debugging

### 4. Tool Configuration & Validation

#### Issues:
- Tools can be created without proper input schemas
- No validation that tools match their API mappings
- No way to test tools before using them

#### Improvements:
- **Input schema validation**:
  - Ensure `type: "object"` is always present
  - Validate properties structure
  - Check required fields
  - Validate against JSON Schema spec
- **Mapping validation**:
  - Verify tool fields exist in input schema
  - Verify API fields exist in payload schema
  - Warn about unmapped required fields
- **Tool testing interface**:
  - Test tool calls from admin panel
  - Preview API requests before execution
  - View transformation results

### 5. Resource Handling

#### Current State:
- Resources are just metadata
- No actual resource fetching

#### Improvements:
- **Resource fetching strategies**:
  - Static resources (stored in DB)
  - Dynamic resources (fetched from API)
  - File system resources
  - URL-based resources
- **Resource caching**
- **Resource templates** (for dynamic content)

### 6. Error Handling & Debugging

#### Improvements:
- **Structured error responses** following MCP protocol
- **Error logging** with request context
- **Debug mode** - detailed error information
- **Request tracing** - track requests through the system
- **Error recovery** - retry logic for transient failures

### 7. Performance & Scalability

#### Improvements:
- **Connection pooling** for API calls
- **Response caching** for frequently called tools
- **Batch operations** (if MCP protocol supports)
- **Async processing** for long-running operations
- **Rate limiting** per MCP/server

### 8. Security Enhancements

#### Improvements:
- **API authentication** - store and use API keys securely
- **Request signing** (if needed)
- **Input sanitization** - prevent injection attacks
- **Expression sandboxing** - safe JavaScript evaluation
- **Access control** - restrict which MCPs can be accessed

## Implementation Phases

### Phase 1: Protocol Compliance & Validation
1. Fix input schema structure validation
2. Implement proper error codes
3. Add protocol version negotiation
4. Validate all JSON-RPC 2.0 responses

### Phase 2: Dynamic Configuration
1. Load capabilities from database
2. Dynamic server info
3. Runtime configuration detection
4. Health check endpoint

### Phase 3: Enhanced API Proxy
1. Request transformation pipeline
2. Response transformation
3. Error handling improvements
4. Request/response logging

### Phase 4: Tool & Resource Management
1. Input schema validation UI
2. Mapping validation
3. Tool testing interface
4. Resource fetching implementation

### Phase 5: Advanced Features
1. Caching layer
2. Rate limiting
3. Security enhancements
4. Performance optimizations

## Technical Specifications

### Input Schema Requirements
```json
{
  "type": "object",  // MUST be "object"
  "properties": {
    "fieldName": {
      "type": "string" | "number" | "boolean" | "array" | "object",
      "description": "Field description",
      "enum": [...] // optional
    }
  },
  "required": ["fieldName"] // optional
}
```

### API Mapping Requirements
- Tool field must exist in tool's input_schema.properties
- API field must exist in API's payload_schema.properties (if schema exists)
- Transformation expressions must be safe

### Error Codes (MCP Protocol)
- `-32700`: Parse error
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32000` to `-32099`: Server error (custom)

## Database Schema Additions (Future)

### mcp_config table
```sql
create table public.mcp_config (
  mcp_id uuid references mcp(id),
  key text,
  value jsonb,
  constraint mcp_config_pkey primary key (mcp_id, key)
);
```

### api_auth table
```sql
create table public.api_auth (
  api_id uuid references api(id),
  auth_type text, -- 'bearer', 'basic', 'api_key', etc.
  credentials jsonb, -- encrypted
  constraint api_auth_pkey primary key (api_id)
);
```

## API Proxy Flow

```
MCP Client Request
  ↓
[Validate Request] → JSON-RPC 2.0 validation
  ↓
[Route by Method] → initialize | tools/list | tools/call | resources/list | resources/read
  ↓
[Load Configuration] → From database (MCP, Tools, Resources, Mappings, APIs)
  ↓
[Transform Request] → Tool args → API payload (using mapping)
  ↓
[Call API] → HTTP request with headers, cookies, params
  ↓
[Transform Response] → API response → MCP format
  ↓
[Return Response] → JSON-RPC 2.0 response
```

## Success Metrics

1. **Protocol Compliance**: 100% JSON-RPC 2.0 compliance
2. **Tool Success Rate**: >95% successful tool invocations
3. **Response Time**: <500ms for tool calls (excluding API latency)
4. **Error Clarity**: All errors provide actionable information
5. **Configuration Flexibility**: Support any API structure through mappings
