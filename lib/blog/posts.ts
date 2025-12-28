import { Metadata } from 'next';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  author: string;
  category: string;
  readingTime: number; // in minutes
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-configure-mcp-in-admin',
    title: 'How to Configure MCP in the Admin Panel',
    description: 'Learn how to set up and configure Model Context Protocol (MCP) servers in the admin panel. Step-by-step guide to creating MCPs with proper naming, slugs, and enable/disable settings.',
    publishedAt: '2024-01-15',
    author: 'API to MCP Team',
    category: 'Configuration',
    readingTime: 5,
    content: `# How to Configure MCP in the Admin Panel

The Model Context Protocol (MCP) is a powerful way to expose your APIs as tools that AI assistants can use. This guide will walk you through configuring an MCP server in the admin panel.

## What is an MCP?

An MCP (Model Context Protocol) server acts as a bridge between AI assistants and your APIs. It transforms your REST API endpoints into tools that can be called by AI models through a standardized protocol.

## Creating Your First MCP

### Step 1: Navigate to MCPs Section

1. Log in to the admin panel
2. Navigate to the **MCPs** section from the sidebar
3. Click the **Create MCP** button

### Step 2: Configure Basic Settings

When creating an MCP, you'll need to provide:

- **Name**: A descriptive name for your MCP server (e.g., "Weather API MCP" or "Customer Data MCP")
- **Slug**: A URL-friendly identifier that will be used to access your MCP
  - The slug is auto-generated from the name, but you can customize it
  - Must be lowercase with hyphens only (e.g., \`weather-api-mcp\`)
  - This slug will be used in the API endpoint: \`/api/mcp/[slug]\`
- **Enable/Disable**: Toggle to enable or disable the MCP
  - When disabled, the MCP will appear as non-existent when accessed via API

### Step 3: Understanding Slugs

The slug is crucial because it's how clients will access your MCP server. For example:

- If your slug is \`weather-api\`, clients will connect to: \`/api/mcp/weather-api\`
- The slug must be unique within your account
- Once created, the slug should remain stable to avoid breaking client connections

### Step 4: Save Your MCP

After filling in the details:

1. Click **Create MCP** to save
2. Your MCP will now appear in the MCPs list
3. You can edit or delete it at any time

## Next Steps

After creating your MCP, you'll want to:

1. **Create Tools**: Define the tools that your MCP will expose
2. **Create APIs**: Set up the API endpoints that your tools will call
3. **Map Tools to APIs**: Connect your tools to their corresponding API endpoints

## Best Practices

- **Use descriptive names**: Make it clear what your MCP does
- **Choose meaningful slugs**: Use slugs that reflect the purpose (e.g., \`customer-crm-api\` not \`mcp-1\`)
- **Start with enabled**: Keep your MCP enabled unless you're testing or troubleshooting
- **Document your MCP**: Add descriptions to help you remember what each MCP does

## Troubleshooting

**MCP not found error?**
- Check that the MCP is enabled
- Verify the slug matches exactly (case-sensitive)
- Ensure you're using the correct API endpoint format

**Can't create MCP?**
- Ensure the slug is unique
- Check that the slug follows the format (lowercase, hyphens only)
- Verify you have the necessary permissions

## Conclusion

Configuring an MCP is the first step in exposing your APIs to AI assistants. Once configured, you can add tools and map them to your APIs to create powerful integrations.

For more information, see our guides on [creating APIs](/blog/how-to-create-api) and [MCP to API mapping](/blog/how-mcp-to-api-mapping-works).`
  },
  {
    slug: 'how-to-create-api',
    title: 'How to Create an API in the Admin Panel',
    description: 'Complete guide to creating and configuring API endpoints in the admin panel. Learn about HTTP methods, headers, cookies, URL parameters, and payload schemas.',
    publishedAt: '2024-01-16',
    author: 'API to MCP Team',
    category: 'API Setup',
    readingTime: 8,
    content: `# How to Create an API in the Admin Panel

APIs are the foundation of your MCP tools. This guide will show you how to create and configure API endpoints that your MCP tools can call.

## Understanding APIs in This System

An API in this system represents a REST API endpoint that can be called by MCP tools. You configure:
- The HTTP method and URL
- Headers, cookies, and URL parameters
- Payload schema for request validation
- Enable/disable status

## Creating Your First API

### Step 1: Navigate to APIs Section

1. Log in to the admin panel
2. Navigate to the **APIs** section from the sidebar
3. Click the **Create API** button

### Step 2: Basic Configuration

#### Name and Description

- **Name**: A descriptive name for your API (e.g., "Get Weather Data" or "Create Customer")
- **Description**: Optional description to help you remember what this API does

#### HTTP Method

Select the HTTP method for your API:
- **GET**: Retrieve data (no request body)
- **POST**: Create new resources
- **PUT**: Update entire resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources
- **HEAD**: Get headers only
- **OPTIONS**: Get allowed methods

#### URL

Enter the full URL of your API endpoint:

\`\`\`
https://api.example.com/v1/weather
\`\`\`

**Dynamic URLs**: You can use variables in the URL that will be replaced with payload values:

\`\`\`
https://api.example.com/users/{userId}/posts
\`\`\`

The \`{userId}\` will be replaced with the value from the payload when the API is called.

### Step 3: Headers Configuration

Headers are sent with every API request. Common use cases:

- **Authorization**: \`Authorization: Bearer {token}\`
- **Content-Type**: \`Content-Type: application/json\`
- **Custom headers**: Any headers your API requires

**Using Variables in Headers**:

You can reference payload fields in header values using \`{variableName}\` syntax:

- \`Bearer {token}\` - Will use the \`token\` field from the payload
- \`application/json; charset={encoding}\` - Dynamic content type

**Example**:
- Header name: \`Authorization\`
- Header value: \`Bearer {apiKey}\`

When called with payload \`{apiKey: "abc123"}\`, the header becomes: \`Authorization: Bearer abc123\`

### Step 4: Cookies Configuration

Configure cookies to be sent with API requests:

- **Cookie name**: The name of the cookie
- **Cookie value**: The value (can use variables like \`{sessionId}\`)

**Example**:
- Cookie name: \`session_id\`
- Cookie value: \`{sessionId}\`

### Step 5: URL Parameters

Add query string parameters to your API URL:

- **Parameter name**: The query parameter name
- **Parameter value**: The value (can use variables)

**Example**:
- Parameter name: \`limit\`
- Parameter value: \`{maxResults}\`

Results in: \`https://api.example.com/data?limit=10\` (if maxResults is 10)

### Step 6: Payload Schema (JSON Schema)

For POST, PUT, and PATCH requests, you can define a JSON Schema that describes the expected request body structure.

**Example Schema**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Customer name"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "number",
      "minimum": 0
    }
  },
  "required": ["name", "email"]
}
\`\`\`

**Benefits of Payload Schema**:
- Documents the expected API structure
- Helps with tool-to-API mapping
- Provides validation guidance

**Note**: The schema is primarily for documentation and mapping purposes. Actual validation happens at the API level.

### Step 7: Enable/Disable

Toggle to enable or disable the API:
- **Enabled**: API can be called by MCP tools
- **Disabled**: API will not be available for mapping

## Complete Example

Here's a complete example of creating a weather API:

**Name**: Get Weather Data
**Method**: GET
**URL**: \`https://api.weather.com/v1/current\`
**Headers**:
- \`X-API-Key: {apiKey}\`
- \`Accept: application/json\`
**URL Parameters**:
- \`location: {city}\`
- \`units: {unitSystem}\`
**Payload Schema**: Not needed for GET requests

## Best Practices

1. **Use descriptive names**: Make it clear what the API does
2. **Document with descriptions**: Help yourself and others understand the API
3. **Use variables wisely**: Leverage \`{variableName}\` for dynamic values
4. **Test your URLs**: Ensure the URL format is correct before saving
5. **Organize by purpose**: Group related APIs with similar naming

## Common Patterns

### Authentication

**Bearer Token**:
- Header: \`Authorization\`
- Value: \`Bearer {token}\`

**API Key in Header**:
- Header: \`X-API-Key\`
- Value: \`{apiKey}\`

### Dynamic URLs

**RESTful Resources**:
\`\`\`
https://api.example.com/users/{userId}/posts/{postId}
\`\`\`

### Query Parameters

**Pagination**:
- \`page: {pageNumber}\`
- \`limit: {pageSize}\`

**Filtering**:
- \`status: {filterStatus}\`
- \`sort: {sortOrder}\`

## Troubleshooting

**API not working?**
- Check the URL is correct and accessible
- Verify headers are properly formatted
- Ensure variables in URLs/headers match payload field names
- Test the API endpoint directly first

**Variables not replacing?**
- Ensure variable names match exactly (case-sensitive)
- Check that the variable exists in the payload
- Verify the syntax: \`{variableName}\` (with curly braces)

## Next Steps

After creating your API:

1. **Create MCP Tools**: Define tools that will use this API
2. **Map Tools to APIs**: Connect tools to this API endpoint
3. **Test the Integration**: Verify the end-to-end flow works

## Conclusion

Creating APIs is straightforward once you understand the configuration options. The key is properly setting up headers, cookies, and URL parameters to match your API's requirements.

For more information, see our guides on [configuring MCPs](/blog/how-to-configure-mcp-in-admin) and [MCP to API mapping](/blog/how-mcp-to-api-mapping-works).`
  },
  {
    slug: 'how-mcp-to-api-mapping-works',
    title: 'How MCP to API Mapping Works',
    description: 'Deep dive into how MCP tools are mapped to API endpoints. Learn about field mappings, transformations, and how tool arguments become API payloads.',
    publishedAt: '2024-01-17',
    author: 'API to MCP Team',
    category: 'Technical',
    readingTime: 10,
    content: `# How MCP to API Mapping Works

The mapping system is the core of how MCP tools connect to your APIs. This guide explains how tool arguments are transformed into API requests.

## Overview

When an AI assistant calls an MCP tool, the system needs to:
1. Take the tool's input arguments
2. Transform them into the format your API expects
3. Call the API with the transformed data
4. Return the API response to the AI assistant

This transformation is handled by **mappings** that connect tool fields to API fields.

## The Mapping Process

### Step 1: Tool Definition

First, you define an MCP tool with an input schema. For example:

\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "City name"
    },
    "unit": {
      "type": "string",
      "description": "Temperature unit (celsius or fahrenheit)"
    }
  },
  "required": ["city"]
}
\`\`\`

This defines what arguments the tool accepts.

#### Simplified Format Support

The admin panel supports a **simplified format** for defining tool input schemas, making it easier to get started. Instead of writing the full JSON Schema structure, you can use a simplified syntax:

**Type-based simplified format**:
\`\`\`json
{
  "city": "string",
  "unit": "string",
  "temperature": "number"
}
\`\`\`

**Description-based simplified format**:
\`\`\`json
{
  "city": "The name of the city",
  "unit": "Temperature unit (celsius or fahrenheit)"
}
\`\`\`

When you use the simplified format, the admin panel will automatically detect it and show a helpful message:

> **ℹ️ Simplified format detected**  
> Your schema will be automatically converted to full JSON Schema format. Found 3 parameters: city, unit, temperature

The system automatically converts simplified formats to full JSON Schema:
- If the value is a valid JSON Schema type (\`string\`, \`number\`, \`integer\`, \`boolean\`, \`array\`, \`object\`), it uses that as the type
- If the value is not a valid type, it treats it as a description and defaults to \`string\` type
- All fields are automatically added to the \`required\` array

You can also click a button in the UI to convert the simplified format to full JSON Schema format immediately, giving you full control over the schema structure.

### Step 2: API Configuration

You configure an API endpoint that expects a different format:

\`\`\`json
{
  "location": "string",
  "temperature_unit": "string"
}
\`\`\`

Notice the field names are different: \`city\` vs \`location\`, \`unit\` vs \`temperature_unit\`.

### Step 3: Create the Mapping

The mapping connects these two formats:

- **Tool field**: \`city\` → **API field**: \`location\`
- **Tool field**: \`unit\` → **API field**: \`temperature_unit\`

## Field Mappings

Field mappings define how each tool field maps to an API field. There are three types of transformations:

### 1. Direct Mapping

The simplest transformation - pass the value as-is:

- **Tool field**: \`city\`
- **API field**: \`location\`
- **Transformation**: \`direct\`

**Result**: \`{city: "New York"}\` → \`{location: "New York"}\`

### 2. Constant Mapping

Use a fixed value regardless of tool input:

- **Tool field**: (none)
- **API field**: \`api_version\`
- **Transformation**: \`constant\`
- **Value**: \`"v1"\`

**Result**: API payload always includes \`{api_version: "v1"}\`

### 3. Expression Mapping

Transform the value using a JavaScript expression:

- **Tool field**: \`temperature\`
- **API field**: \`temp_celsius\`
- **Transformation**: \`expression\`
- **Expression**: \`value * 9/5 + 32\` (convert Celsius to Fahrenheit)

**Result**: \`{temperature: 20}\` → \`{temp_celsius: 68}\`

## Mapping Configuration Structure

A complete mapping configuration looks like this:

\`\`\`json
{
  "field_mappings": [
    {
      "tool_field": "city",
      "api_field": "location",
      "transformation": "direct"
    },
    {
      "tool_field": "unit",
      "api_field": "temperature_unit",
      "transformation": "direct"
    },
    {
      "api_field": "api_version",
      "transformation": "constant",
      "value": "v1"
    },
    {
      "tool_field": "temp",
      "api_field": "temperature",
      "transformation": "expression",
      "expression": "value + 273.15"
    }
  ],
  "static_fields": {
    "source": "mcp",
    "timestamp": "auto"
  }
}
\`\`\`

## The Complete Flow

### 1. Tool Call

An AI assistant calls the tool:

\`\`\`json
{
  "name": "get_weather",
  "arguments": {
    "city": "San Francisco",
    "unit": "celsius"
  }
}
\`\`\`

### 2. Mapping Lookup

The system looks up the mapping for this tool and finds:
- Tool \`get_weather\` → Mapping → API \`weather-api\`

### 3. Transformation

The transformer applies the mappings:

\`\`\`javascript
// Input: {city: "San Francisco", unit: "celsius"}
// Mappings applied:
{
  location: "San Francisco",        // city → location (direct)
  temperature_unit: "celsius",      // unit → temperature_unit (direct)
  api_version: "v1",                // constant
  source: "mcp",                    // static field
  timestamp: "auto"                  // static field
}
\`\`\`

### 4. API Call

The transformed payload is sent to the API:

\`\`\`
POST https://api.weather.com/v1/current
Headers: {...}
Body: {
  "location": "San Francisco",
  "temperature_unit": "celsius",
  "api_version": "v1",
  "source": "mcp",
  "timestamp": "auto"
}
\`\`\`

### 5. Response Handling

The API response is returned to the AI assistant in MCP format:

\`\`\`json
{
  "content": [
    {
      "type": "text",
      "text": "{\\"temperature\\": 18, \\"condition\\": \\"sunny\\"}"
    }
  ],
  "isError": false
}
\`\`\`

## Advanced Features

### Static Fields

Add fields that are always included in the API payload:

\`\`\`json
{
  "static_fields": {
    "client_id": "mcp-client",
    "version": "1.0"
  }
}
\`\`\`

These fields are merged into every API request.

### URL Variable Substitution

If your API URL contains variables, they're replaced from the payload:

**API URL**: \`https://api.example.com/users/{userId}/posts\`

**Tool argument**: \`{userId: "123"}\`

**Result**: \`https://api.example.com/users/123/posts\`

### Header Variable Substitution

Headers can also use variables from the payload:

**Header**: \`Authorization: Bearer {token}\`

**Tool argument**: \`{token: "abc123"}\`

**Result**: \`Authorization: Bearer abc123\`

## Expression Transformations

Expression transformations allow you to modify values using JavaScript:

### Common Use Cases

**String Concatenation**:
\`\`\`
Expression: \`"prefix-" + value + "-suffix"\`
Input: \`{name: "test"}\`
Output: \`"prefix-test-suffix"\`
\`\`\`

**Number Conversion**:
\`\`\`
Expression: \`parseInt(value) * 2\`
Input: \`{count: "5"}\`
Output: \`10\`
\`\`\`

**Conditional Logic**:
\`\`\`
Expression: \`value === "yes" ? true : false\`
Input: \`{enabled: "yes"}\`
Output: \`true\`
\`\`\`

**Note**: Expression evaluation should be used carefully. In production, consider using a sandboxed evaluator for security.

## Best Practices

### 1. Keep Mappings Simple

Prefer direct mappings when possible. Only use expressions when necessary.

### 2. Document Your Mappings

Add comments or descriptions explaining why certain transformations are needed.

### 3. Test Your Mappings

After creating a mapping:
1. Test with sample tool arguments
2. Verify the API receives the correct payload
3. Check the API response is properly formatted

### 4. Handle Missing Fields

Consider what happens when optional tool fields are missing:
- Direct mappings: Field is omitted from API payload
- Constants: Always included
- Expressions: May cause errors if value is undefined

### 5. Validate Field Names

Ensure:
- Tool field names match your tool's input schema
- API field names match your API's expected format
- Variable names in URLs/headers match payload field names

## Common Patterns

### RESTful Resource IDs

**Tool**: \`{userId: "123", action: "get"}\`
**Mapping**: \`userId\` → URL variable \`{userId}\`
**API URL**: \`https://api.example.com/users/{userId}\`

### Authentication Tokens

**Tool**: \`{apiKey: "secret123"}\`
**Mapping**: \`apiKey\` → Header \`Authorization: Bearer {apiKey}\`

### Data Transformation

**Tool**: \`{tempC: 20}\`
**Mapping**: Expression \`value + 273.15\` → \`tempK\`
**Result**: Converts Celsius to Kelvin

### Default Values

**Tool**: \`{query: "search term"}\`
**Mapping**: Constant \`"en"\` → \`language\`
**Result**: Always includes \`language: "en"\` in payload

## Troubleshooting

### Mapping Not Applied

**Symptoms**: API receives wrong data or missing fields

**Solutions**:
- Verify the mapping is saved and active
- Check field names match exactly (case-sensitive)
- Ensure the tool has the mapping configured
- Verify the API is enabled

### Expression Errors

**Symptoms**: Transformation fails with error

**Solutions**:
- Check expression syntax is valid JavaScript
- Verify the input value type matches expression expectations
- Test the expression with sample values
- Consider using direct mapping if expression isn't needed

### Variable Substitution Not Working

**Symptoms**: \`{variableName}\` appears literally in URL/headers

**Solutions**:
- Ensure variable name matches payload field name exactly
- Check that the field exists in the tool arguments
- Verify the variable is in the correct location (URL vs header vs body)

## Conclusion

MCP to API mapping is a powerful system that allows you to bridge the gap between AI tool interfaces and your existing APIs. By understanding field mappings, transformations, and the complete flow, you can create robust integrations.

The key is matching tool inputs to API requirements through careful mapping configuration. Start simple with direct mappings, then add transformations as needed.

For more information, see our guides on [configuring MCPs](/blog/how-to-configure-mcp-in-admin) and [creating APIs](/blog/how-to-create-api).`
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function generateMetadataForPost(post: BlogPost): Metadata {
  return {
    title: `${post.title} | API to MCP Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: [post.category],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}
