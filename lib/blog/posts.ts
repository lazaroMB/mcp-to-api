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
  },
  {
    slug: 'how-to-create-mcp-tools',
    title: 'How to Create MCP Tools',
    description: 'Learn how to define MCP tools that expose your APIs to AI assistants. Step-by-step guide to creating tools with input schemas, descriptions, and URIs.',
    publishedAt: '2024-01-18',
    author: 'API to MCP Team',
    category: 'Configuration',
    readingTime: 7,
    content: `# How to Create MCP Tools

MCP tools are the interface that AI assistants use to interact with your APIs. This guide will show you how to create and configure tools in the admin panel.

## What are MCP Tools?

MCP tools are functions that AI assistants can call. Each tool:
- Has a name and description that AI assistants understand
- Defines input parameters through a JSON Schema
- Maps to an API endpoint that performs the actual work
- Can be discovered and invoked by MCP-compatible clients

## Creating Your First Tool

### Step 1: Navigate to MCP Detail Page

1. Log in to the admin panel
2. Navigate to the **MCPs** section
3. Click on an MCP to view its detail page
4. Find the **Tools** section

### Step 2: Click "Create Tool"

In the Tools section, click the **Create Tool** button to open the tool creation form.

### Step 3: Configure Tool Details

#### Name

The tool name is how AI assistants will identify and call your tool. Choose a clear, descriptive name:

- **Good**: \`get_weather\`, \`create_customer\`, \`search_products\`
- **Avoid**: \`tool1\`, \`api_call\`, \`function\`

**Naming conventions**:
- Use lowercase with underscores: \`get_user_profile\`
- Be descriptive: \`get_weather_by_city\` not \`weather\`
- Use action verbs: \`create\`, \`get\`, \`update\`, \`delete\`, \`search\`

#### Description

Write a clear description of what the tool does. This helps AI assistants understand when to use it:

**Example**:
\`\`\`
Retrieves current weather information for a specified city. Returns temperature, conditions, humidity, and wind speed.
\`\`\`

**Tips for descriptions**:
- Explain what the tool does, not how it works
- Mention key parameters
- Describe the expected output
- Use natural language that AI assistants can understand

#### Input Schema (JSON Schema)

The input schema defines what parameters the tool accepts. This is a JSON Schema that describes the structure and validation rules.

**Basic Example**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "The name of the city"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"],
      "description": "Temperature unit"
    }
  },
  "required": ["city"]
}
\`\`\`

**Simplified Format Support**:

The admin panel supports a simplified format for easier tool creation:

**Type-based**:
\`\`\`json
{
  "city": "string",
  "temperature": "number",
  "enabled": "boolean"
}
\`\`\`

**Description-based**:
\`\`\`json
{
  "city": "The name of the city",
  "unit": "Temperature unit (celsius or fahrenheit)"
}
\`\`\`

The system automatically converts simplified formats to full JSON Schema.

**Common Schema Patterns**:

**String with validation**:
\`\`\`json
{
  "email": {
    "type": "string",
    "format": "email",
    "description": "User email address"
  }
}
\`\`\`

**Number with range**:
\`\`\`json
{
  "age": {
    "type": "number",
    "minimum": 0,
    "maximum": 150,
    "description": "Person's age"
  }
}
\`\`\`

**Enum (choice of values)**:
\`\`\`json
{
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "pending"],
    "description": "Account status"
  }
}
\`\`\`

**Array**:
\`\`\`json
{
  "tags": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "List of tags"
  }
}
\`\`\`

**Nested objects**:
\`\`\`json
{
  "address": {
    "type": "object",
    "properties": {
      "street": {"type": "string"},
      "city": {"type": "string"},
      "zip": {"type": "string"}
    },
    "required": ["street", "city"]
  }
}
\`\`\`

#### URI (Optional)

The URI is an optional identifier for the tool. It's used for resource identification in some MCP contexts.

**Examples**:
- \`weather://current\`
- \`api://users/create\`
- \`mcp://weather/forecast\`

If not specified, the system will generate one based on the tool name.

### Step 4: Save the Tool

Click **Create Tool** to save. The tool will appear in the Tools section of your MCP.

## Complete Example

Here's a complete example of creating a weather tool:

**Name**: \`get_weather\`

**Description**: \`Retrieves current weather conditions for a specified city. Returns temperature, humidity, wind speed, and conditions.\`

**Input Schema**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "The name of the city"
    },
    "country": {
      "type": "string",
      "description": "Country code (e.g., 'US', 'GB')"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"],
      "default": "celsius",
      "description": "Temperature unit"
    }
  },
  "required": ["city"]
}
\`\`\`

**URI**: \`weather://current\`

## Best Practices

### 1. Clear Naming

- Use descriptive, action-oriented names
- Follow consistent naming conventions
- Avoid abbreviations unless widely understood

### 2. Comprehensive Descriptions

- Explain what the tool does
- Mention important parameters
- Describe expected behavior
- Include any limitations or requirements

### 3. Well-Defined Schemas

- Use appropriate data types
- Add descriptions to all fields
- Mark required fields
- Use enums for limited choices
- Add validation where appropriate

### 4. Required vs Optional Fields

Only mark fields as required if they're truly necessary:
- **Required**: Essential parameters (e.g., \`city\` for weather)
- **Optional**: Nice-to-have parameters (e.g., \`unit\` with a default)

### 5. Schema Validation

Add validation to help AI assistants provide correct inputs:
- String formats: \`email\`, \`date\`, \`uri\`
- Number ranges: \`minimum\`, \`maximum\`
- String patterns: \`pattern\` with regex
- Array constraints: \`minItems\`, \`maxItems\`

## Common Patterns

### Search Tools

\`\`\`json
{
  "query": {
    "type": "string",
    "description": "Search query"
  },
  "limit": {
    "type": "number",
    "minimum": 1,
    "maximum": 100,
    "default": 10,
    "description": "Maximum number of results"
  }
}
\`\`\`

### Creation Tools

\`\`\`json
{
  "name": {
    "type": "string",
    "description": "Resource name"
  },
  "data": {
    "type": "object",
    "description": "Additional resource data"
  }
}
\`\`\`

### Update Tools

\`\`\`json
{
  "id": {
    "type": "string",
    "description": "Resource identifier"
  },
  "updates": {
    "type": "object",
    "description": "Fields to update"
  }
}
\`\`\`

## Next Steps

After creating your tool:

1. **Map Tool to API**: Connect the tool to an API endpoint
2. **Test the Tool**: Verify it works with sample inputs
3. **Refine the Schema**: Adjust based on actual usage

## Troubleshooting

**Tool not appearing?**
- Check that the MCP is enabled
- Verify the tool was saved successfully
- Refresh the page

**Schema validation errors?**
- Ensure valid JSON syntax
- Check that types are correct
- Verify required fields are properly marked

**AI assistant not using tool?**
- Improve the description to be more specific
- Check that the tool name is clear
- Ensure the schema matches expected inputs

## Conclusion

Creating MCP tools is about defining clear interfaces that AI assistants can understand and use. Focus on descriptive names, comprehensive descriptions, and well-structured input schemas.

For more information, see our guides on [configuring MCPs](/blog/how-to-configure-mcp-in-admin), [creating APIs](/blog/how-to-create-api), and [mapping tools to APIs](/blog/how-mcp-to-api-mapping-works).`
  },
  {
    slug: 'complete-admin-guide',
    title: 'Complete Admin Guide: Setting Up Your First MCP Server',
    description: 'A comprehensive step-by-step guide to setting up your first MCP server from start to finish. Learn how to create APIs, MCPs, tools, and mappings.',
    publishedAt: '2024-01-19',
    author: 'API to MCP Team',
    category: 'Tutorial',
    readingTime: 15,
    content: `# Complete Admin Guide: Setting Up Your First MCP Server

This comprehensive guide will walk you through the complete workflow of setting up an MCP server that connects to your APIs. Follow these steps in order to create a fully functional MCP server.

## Overview

Setting up an MCP server involves four main steps:

1. **Create API endpoints** - Define the REST APIs your tools will call
2. **Create an MCP server** - Set up the MCP server configuration
3. **Create MCP tools** - Define the tools that AI assistants can use
4. **Map tools to APIs** - Connect tools to their corresponding API endpoints

Let's go through each step in detail.

## Step 1: Create an API Endpoint

Before you can map tools to APIs, you need to create the API endpoints.

### Navigate to APIs

1. Log in to the admin panel
2. Go to the **APIs** section from the sidebar
3. Click the **Create API** button

### Configure the API

Fill in the following information:

**Name**: A descriptive name (e.g., "Get Weather Data")

**Method**: Select the HTTP method (GET, POST, PUT, PATCH, DELETE, etc.)

**URL**: The full API endpoint URL. You can use variables like \`{city}\` that will be replaced with payload values.

**Description**: Optional description of what the API does

**Headers**: Add any required headers. You can use variables: \`Authorization: Bearer {token}\`

**Cookies**: Add any required cookies with variable support

**URL Parameters**: Add query parameters if needed, with variable support

**Payload Schema**: For POST/PUT/PATCH requests, define a JSON Schema describing the expected request body structure

**Enable/Disable**: Toggle to enable or disable the API

### Save the API

Click **Create API** to save. The API will appear in your APIs list.

**Example API Configuration**:

- **Name**: Get Weather Data
- **Method**: GET
- **URL**: \`https://api.weather.com/v1/current\`
- **Headers**: 
  - \`X-API-Key: {apiKey}\`
  - \`Accept: application/json\`
- **URL Parameters**:
  - \`location: {city}\`
  - \`units: {unit}\`

For detailed information, see our guide on [creating APIs](/blog/how-to-create-api).

## Step 2: Create an MCP Server

Now create the MCP server that will host your tools.

### Navigate to MCPs

1. Go to the **MCPs** section from the sidebar
2. Click the **Create MCP** button

### Configure the MCP

**Name**: A descriptive name (e.g., "Weather API MCP")

**Slug**: URL-friendly identifier. Auto-generated from name, or enter manually. Must be lowercase with hyphens only.

**Enable MCP**: Toggle to enable or disable the MCP server

### Save the MCP

Click **Create MCP** to save. You'll be redirected to the MCP detail page where you can add tools.

**Example MCP Configuration**:

- **Name**: Weather API MCP
- **Slug**: \`weather-api-mcp\`
- **Enabled**: Yes

The MCP will be accessible at: \`/api/mcp/weather-api-mcp\`

For detailed information, see our guide on [configuring MCPs](/blog/how-to-configure-mcp-in-admin).

## Step 3: Create MCP Tools

Define the tools that AI assistants can use to interact with your APIs.

### Navigate to MCP Detail Page

1. From the MCPs list, click on your MCP
2. Find the **Tools** section
3. Click **Create Tool**

### Configure the Tool

**Name**: Tool identifier (e.g., \`get_weather\`). Use lowercase with underscores.

**Description**: Clear description of what the tool does. This helps AI assistants understand when to use it.

**Input Schema**: JSON Schema defining the tool's input parameters. You can use simplified formats that are automatically converted.

**URI**: Optional URI identifier for the tool

### Save the Tool

Click **Create Tool** to save. The tool will appear in the Tools section.

**Example Tool Configuration**:

- **Name**: \`get_weather\`
- **Description**: \`Retrieves current weather conditions for a specified city. Returns temperature, humidity, wind speed, and conditions.\`
- **Input Schema**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "The name of the city"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"],
      "default": "celsius",
      "description": "Temperature unit"
    }
  },
  "required": ["city"]
}
\`\`\`

For detailed information, see our guide on [creating MCP tools](/blog/how-to-create-mcp-tools).

## Step 4: Map Tools to APIs

Connect your tools to their corresponding API endpoints and configure how tool arguments map to API payloads.

### Open Tool Mapping

1. In the Tools section, find the tool you want to map
2. Click **Map to API** or the mapping button

### Select an API

1. In the mapping form, select the API endpoint you created in Step 1 from the dropdown
2. The form will show information about the selected API

### Configure Field Mappings

Map fields from the tool's input schema to the API's payload fields.

For each mapping:

**Tool Field**: Select a field from the tool's input schema

**API Field**: Select the corresponding field in the API payload

**Transformation**: Choose how to transform the value:
- **Direct**: Pass value as-is
- **Constant**: Use a fixed value
- **Expression**: Transform using JavaScript expression

**Example Mappings**:

- Tool field \`city\` → API field \`location\` (direct)
- Tool field \`unit\` → API field \`temperature_unit\` (direct)
- Constant value \`"v1"\` → API field \`api_version\` (constant)

### Save the Mapping

Click **Create Mapping** to save. The tool is now connected to your API endpoint.

**Example Mapping Configuration**:

- **API**: Get Weather Data
- **Field Mappings**:
  - \`city\` → \`location\` (direct)
  - \`unit\` → \`units\` (direct)
  - \`apiKey\` → Header \`X-API-Key: {apiKey}\`

For detailed information, see our guide on [MCP to API mapping](/blog/how-mcp-to-api-mapping-works).

## Testing Your MCP Server

Once configured, your MCP server is ready to use.

### Access Your MCP Server

Your MCP server is available at:

\`\`\`
/api/mcp/[your-mcp-slug]
\`\`\`

For example: \`/api/mcp/weather-api-mcp\`

### Test Endpoints

You can test your MCP server using these endpoints:

**List Tools**:
\`\`\`
GET /api/mcp/[slug]/tools
\`\`\`

**Call a Tool**:
\`\`\`
POST /api/mcp/[slug]/tools/call
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "city": "San Francisco",
      "unit": "celsius"
    }
  },
  "id": 1
}
\`\`\`

**List Resources**:
\`\`\`
GET /api/mcp/[slug]/resources
\`\`\`

### Using with MCP Clients

Your MCP server is compatible with any MCP client. Connect using:

- **URL**: Your domain + \`/api/mcp/[slug]\`
- **Protocol**: MCP (JSON-RPC 2.0)

## Complete Workflow Example

Let's walk through a complete example: creating a weather MCP server.

### 1. Create API

**API Configuration**:
- Name: Get Weather Data
- Method: GET
- URL: \`https://api.weather.com/v1/current\`
- Headers: \`X-API-Key: {apiKey}\`
- URL Parameters: \`location: {city}\`, \`units: {unit}\`

### 2. Create MCP

**MCP Configuration**:
- Name: Weather API MCP
- Slug: \`weather-api-mcp\`
- Enabled: Yes

### 3. Create Tool

**Tool Configuration**:
- Name: \`get_weather\`
- Description: Retrieves current weather for a city
- Input Schema:
\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "apiKey": {"type": "string"}
  },
  "required": ["city", "apiKey"]
}
\`\`\`

### 4. Map Tool to API

**Mapping Configuration**:
- API: Get Weather Data
- Mappings:
  - \`city\` → URL parameter \`location\`
  - \`unit\` → URL parameter \`units\`
  - \`apiKey\` → Header \`X-API-Key\`

### Result

AI assistants can now call \`get_weather\` with:
\`\`\`json
{
  "city": "San Francisco",
  "unit": "celsius",
  "apiKey": "your-api-key"
}
\`\`\`

The system will:
1. Transform arguments to API format
2. Call \`https://api.weather.com/v1/current?location=San%20Francisco&units=celsius\`
3. Include header \`X-API-Key: your-api-key\`
4. Return the weather data to the AI assistant

## Best Practices

### 1. Start Simple

Begin with a single API, one tool, and direct field mappings. Add complexity as needed.

### 2. Use Descriptive Names

- APIs: "Get Weather Data" not "API 1"
- MCPs: "Weather API MCP" not "MCP 1"
- Tools: \`get_weather\` not \`tool1\`

### 3. Document Everything

- Add descriptions to APIs
- Write clear tool descriptions
- Document field mappings

### 4. Test Incrementally

- Test the API directly first
- Verify the tool schema
- Test the mapping with sample data
- Test the complete flow

### 5. Handle Errors

- Check API responses
- Validate tool inputs
- Handle missing mappings
- Provide clear error messages

## Troubleshooting

### MCP Not Found

- Check that the MCP is enabled
- Verify the slug matches exactly
- Ensure you're using the correct endpoint format

### Tool Not Working

- Verify the tool has a mapping
- Check that the API is enabled
- Ensure field mappings are correct
- Test the API directly

### Mapping Issues

- Verify field names match exactly
- Check transformation types
- Ensure required fields are mapped
- Test with sample data

### API Errors

- Verify the API URL is correct
- Check headers and authentication
- Ensure variables are properly replaced
- Test the API endpoint directly

## Next Steps

After setting up your first MCP server:

1. **Add More Tools**: Create additional tools for different operations
2. **Create Multiple MCPs**: Organize tools by purpose or API group
3. **Refine Mappings**: Optimize field mappings based on usage
4. **Monitor Usage**: Check statistics to see which tools are used most

## Additional Resources

- [How to Configure MCP in the Admin Panel](/blog/how-to-configure-mcp-in-admin)
- [How to Create an API](/blog/how-to-create-api)
- [How to Create MCP Tools](/blog/how-to-create-mcp-tools)
- [How MCP to API Mapping Works](/blog/how-mcp-to-api-mapping-works)

## Conclusion

Setting up an MCP server is a straightforward process when you follow these steps in order. Start with creating your APIs, then set up the MCP server, define your tools, and finally map them together.

Remember to test each step as you go, and don't hesitate to refine your configuration based on actual usage.`
  },
  {
    slug: 'how-to-import-openapi-into-api-admin',
    title: 'How to Import OpenAPI Specifications into API Admin',
    description: 'Learn how to quickly import multiple API endpoints from an OpenAPI (Swagger) specification file. Save time by automatically creating all APIs from a single URL.',
    publishedAt: '2024-01-20',
    author: 'API to MCP Team',
    category: 'API Setup',
    readingTime: 6,
    content: `# How to Import OpenAPI Specifications into API Admin

Importing APIs manually can be time-consuming, especially when working with large APIs that have dozens or hundreds of endpoints. The OpenAPI import feature allows you to automatically create all API endpoints from an OpenAPI (Swagger) specification file with just a few clicks.

## What is OpenAPI?

OpenAPI (formerly known as Swagger) is a specification format for describing REST APIs. It's a standard way to document APIs that includes:

- All available endpoints
- HTTP methods (GET, POST, PUT, DELETE, etc.)
- Request and response schemas
- Parameters (query, path, header, cookie)
- Authentication requirements
- And much more

Many APIs provide their OpenAPI specification at a public URL, making it easy to import all their endpoints at once.

## Benefits of Importing OpenAPI

- **Save Time**: Import dozens or hundreds of APIs in seconds instead of creating them one by one
- **Accuracy**: Automatically extract correct URLs, methods, parameters, and schemas
- **Completeness**: Ensure you don't miss any endpoints
- **Consistency**: All APIs follow the same structure from the specification

## How to Import OpenAPI

### Step 1: Find Your OpenAPI Specification URL

First, you need the URL to your OpenAPI specification file. Common locations include:

- \`https://api.example.com/openapi.json\`
- \`https://api.example.com/swagger.json\`
- \`https://api.example.com/v1/openapi.yaml\`
- \`https://api.example.com/docs/openapi.json\`

Many API providers document where to find their OpenAPI spec. You can also check:
- API documentation pages
- Developer portals
- GitHub repositories
- API explorer tools

**Note**: The import feature supports both JSON and YAML formats, and works with both OpenAPI 3.x and Swagger 2.0 specifications.

### Step 2: Navigate to the APIs Section

1. Log in to the admin panel
2. Navigate to the **APIs** section from the sidebar
3. You'll see the **Import from OpenAPI** button next to the **Create API** button

### Step 3: Import the Specification

1. Click the **Import from OpenAPI** button
2. A dialog will open asking for the OpenAPI URL
3. Enter the full URL to your OpenAPI specification file
4. Click **Import**

The system will:
- Fetch the OpenAPI specification from the URL
- Parse all endpoints and their configurations
- Extract HTTP methods, URLs, parameters, headers, and request schemas
- Create all APIs in your database
- Show you a summary of what was imported

### Step 4: Review Import Results

After importing, you'll see a summary showing:
- **Number of APIs imported**: How many endpoints were successfully created
- **Errors (if any)**: Any endpoints that couldn't be imported and why

All successfully imported APIs will appear in your APIs list, ready to be used in your MCP tools.

## What Gets Imported?

The import process extracts and creates APIs with the following information:

### Basic Information
- **Name**: Extracted from \`operationId\`, \`summary\`, or generated from method and path
- **Description**: Taken from the endpoint's \`description\` or \`summary\` field
- **HTTP Method**: GET, POST, PUT, PATCH, DELETE, etc.
- **URL**: Full URL combining the base server URL and endpoint path

### Parameters
- **Path Parameters**: Variables in the URL path (e.g., \`/users/{id}\`)
- **Query Parameters**: URL query string parameters
- **Headers**: Custom headers defined in the specification
- **Cookies**: Cookie parameters if specified

### Request Body Schema
- **Payload Schema**: JSON Schema extracted from the \`requestBody\` definition
- This schema is used for validation and can be referenced when creating tool mappings

## Example: Importing a Weather API

Let's say you want to import the OpenWeatherMap API. Here's how:

1. Find their OpenAPI spec URL (e.g., \`https://api.openweathermap.org/openapi.json\`)
2. Click **Import from OpenAPI** in the admin panel
3. Paste the URL and click **Import**
4. The system will create APIs for all endpoints like:
   - \`GET /data/2.5/weather\` - Get current weather
   - \`GET /data/2.5/forecast\` - Get weather forecast
   - \`GET /geo/1.0/direct\` - Geocoding API
   - And many more...

All endpoints will be automatically configured with their parameters, headers, and schemas.

## Handling Import Errors

Sometimes, not all endpoints can be imported successfully. Common reasons include:

- **Invalid URL format**: The endpoint URL couldn't be constructed properly
- **Missing required fields**: The specification is missing critical information
- **Database errors**: Issues saving to the database (rare)

When errors occur:
- The import will still succeed for valid endpoints
- You'll see a detailed error message for each failed endpoint
- You can manually create any failed endpoints if needed

## After Importing

Once your APIs are imported:

1. **Review the APIs**: Check that all endpoints were imported correctly
2. **Edit if Needed**: You can edit any API to adjust names, descriptions, or configurations
3. **Create MCP Tools**: Use these APIs when creating tools for your MCP servers
4. **Map Tools to APIs**: Connect your tools to the imported APIs

## Best Practices

### Verify the Specification
- Test the OpenAPI URL in your browser first to ensure it's accessible
- Check that the specification is valid and complete
- Verify it's the version you want (some APIs have multiple versions)

### Review Imported APIs
- Check that API names are descriptive (edit if needed)
- Verify URLs are correct (especially if the base URL changed)
- Ensure parameters and schemas look correct

### Organize After Import
- Consider grouping related APIs (you can add prefixes to names)
- Add descriptions to APIs that need clarification
- Disable any APIs you don't plan to use

### Keep APIs Updated
- If the API specification changes, you can re-import
- Note that re-importing won't automatically update existing APIs
- You may need to delete and re-import, or manually update APIs

## Troubleshooting

### "Failed to fetch OpenAPI specification"
- **Check the URL**: Ensure the URL is correct and accessible
- **CORS Issues**: Some servers block cross-origin requests. You may need to download the file and host it yourself
- **Authentication**: If the spec requires authentication, you may need to download it manually first

### "No endpoints found"
- The specification might not have a \`paths\` section
- Check that the file is a valid OpenAPI specification
- Verify it's not a different format (like GraphQL schema)

### "Invalid URL format"
- The base server URL might be malformed
- Some specifications use relative URLs that need a base URL
- Check the \`servers\` array in the OpenAPI spec

### Some APIs Failed to Import
- Check the error messages for specific reasons
- Common issues: missing operation IDs, invalid schemas, or database constraints
- You can manually create any failed APIs

## Supported Formats

The import feature supports:
- **OpenAPI 3.0.x**: Full support for all features
- **OpenAPI 3.1.x**: Full support for all features
- **Swagger 2.0**: Converted to OpenAPI 3.0 format automatically
- **JSON format**: \`.json\` files
- **YAML format**: \`.yaml\` or \`.yml\` files (converted automatically)

## Limitations

- **Authentication**: The import doesn't automatically configure API authentication. You'll need to add authentication headers manually after import.
- **Response Schemas**: Currently, only request body schemas are imported. Response schemas aren't stored but can be referenced from the original spec.
- **Complex Schemas**: Very complex or circular schemas might be simplified during import.
- **Custom Extensions**: OpenAPI extensions (like \`x-codegen\`) are not imported.

## Next Steps

After importing your APIs:

1. **Create MCP Tools**: [Learn how to create tools](/blog/how-to-create-mcp-tools) that use these APIs
2. **Map Tools to APIs**: [Understand how mappings work](/blog/how-mcp-to-api-mapping-works) to connect tools to APIs
3. **Configure Authentication**: Add any required authentication headers to your APIs
4. **Test Your APIs**: Verify that the imported APIs work correctly before using them in production

## Conclusion

The OpenAPI import feature is a powerful way to quickly set up multiple APIs from a specification file. Instead of manually creating dozens of API endpoints, you can import them all at once and start building your MCP tools immediately.

Whether you're working with a third-party API that provides an OpenAPI spec, or you've documented your own API, the import feature will save you significant time and ensure accuracy.

For more information, see our guides on [creating APIs manually](/blog/how-to-create-api) and [setting up MCP servers](/blog/how-to-configure-mcp-in-admin).`
  },
  {
    slug: 'how-to-add-api-to-mcp',
    title: 'How to Add an API to an MCP with One Click',
    description: 'Learn how to quickly add any API to an MCP server with automatic tool creation and mapping. The "Add to MCP" feature streamlines the process of exposing APIs as MCP tools.',
    publishedAt: '2024-01-25',
    author: 'API to MCP Team',
    category: 'Tutorial',
    readingTime: 6,
    content: `# How to Add an API to an MCP with One Click

The "Add to MCP" feature is a powerful time-saver that automatically creates a tool from your API and configures all the mappings. Instead of manually creating a tool, defining its input schema, and setting up field mappings, you can do it all with a single click.

## What is "Add to MCP"?

"Add to MCP" is a feature that:
- **Automatically creates a tool** from your API configuration
- **Generates the input schema** based on your API's payload schema or URL parameters
- **Creates default mappings** that map tool fields to API fields one-to-one
- **Configures everything** so your tool is ready to use immediately

This feature is perfect when you want to quickly expose an API as an MCP tool without manual configuration.

## When to Use "Add to MCP"

Use this feature when:
- ✅ You want to quickly expose an API as a tool
- ✅ Your API's payload schema matches what you want the tool to accept
- ✅ You're okay with one-to-one field mappings (you can customize later)
- ✅ You want to get started quickly and refine later

Consider manual tool creation when:
- ⚠️ You need complex field transformations
- ⚠️ Your tool needs a different input schema than your API
- ⚠️ You want to combine multiple APIs into one tool

## How to Use "Add to MCP"

### Method 1: From the API List

1. **Navigate to APIs**: Go to the **APIs** section in the admin panel
2. **Find your API**: Locate the API you want to add to an MCP
3. **Click "Add to MCP"**: Click the **Add to MCP** button in the Actions column
4. **Select or Create MCP**: 
   - Choose an existing MCP from the dropdown, or
   - Click "Create New MCP" to create one on the fly
5. **Configure**: The system will automatically create the tool and open the MCP configuration page

### Method 2: From the API Edit Form

1. **Edit an API**: Open any API for editing
2. **Click "Add to MCP"**: Find the **Add to MCP** button in the form footer
3. **Select or Create MCP**: Choose your MCP or create a new one
4. **Auto-configure**: The tool will be created and you'll be taken to configure it

## What Happens Automatically

When you use "Add to MCP", the system automatically:

### 1. Creates the Tool

The tool is created with:
- **Name**: Generated from the API name (sanitized for tool naming)
- **Description**: Uses the API description or generates one from the method and name
- **Input Schema**: Generated from your API's payload schema or URL parameters
- **URI**: Auto-generated in the format \`tool://tool_name\`

**Example**:
- API Name: \`Get Weather Data\`
- Generated Tool Name: \`get_weather_data\`
- Generated URI: \`tool://get_weather_data\`

### 2. Generates Input Schema

The input schema is created based on your API configuration:

#### If API Has Payload Schema

If your API has a \`payload_schema\` defined, the tool's input schema will match it:

**API Payload Schema**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "The city name"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"]
    }
  },
  "required": ["city"]
}
\`\`\`

**Generated Tool Input Schema**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "The city name"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"]
    }
  },
  "required": ["city", "unit"]
}
\`\`\`

#### If API Has URL Parameters

If your API has no payload schema but has URL parameters, the system creates an input schema from those parameters:

**API Configuration**:
- URL: \`/api/users/{userId}/posts\`
- URL Params: \`[{ name: "page", value: "{page}" }, { name: "limit", value: "{limit}" }]\`

**Generated Tool Input Schema**:
\`\`\`json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "userId parameter from URL path"
    },
    "page": {
      "type": "string",
      "description": "page parameter (used in page URL parameter)"
    },
    "limit": {
      "type": "string",
      "description": "limit parameter (used in limit URL parameter)"
    }
  },
  "required": ["userId", "page", "limit"]
}
\`\`\`

### 3. Creates Default Mappings

The system creates one-to-one field mappings automatically:

**Example Mappings**:
- Tool field \`city\` → API field \`city\` (direct)
- Tool field \`unit\` → API field \`unit\` (direct)
- Tool field \`userId\` → URL variable \`{userId}\` (direct)
- Tool field \`page\` → URL parameter \`page\` with value \`{page}\` (direct)

All mappings use **direct transformation**, meaning values are passed as-is. You can customize these later if needed.

## After Adding to MCP

Once you've added an API to an MCP, you'll be taken to the MCP detail page where:

1. **The tool is highlighted**: The newly created tool is shown in edit mode
2. **Mapping is visible**: You can see the API mapping section with the default mappings
3. **Ready to customize**: You can immediately edit the tool or mappings if needed

### Customizing the Tool

You can customize:
- **Tool name**: Change it to something more descriptive
- **Description**: Update to better explain what the tool does
- **Input schema**: Modify parameters, types, or add/remove fields
- **Mappings**: Adjust field mappings, add transformations, or change mappings

### Testing the Tool

After creation, you can:
1. **View the tool**: See all its details in the MCP detail page
2. **Check the mapping**: Verify the API mapping is correct
3. **Test via MCP**: Use an MCP client to test the tool
4. **Review logs**: Check tool usage statistics if available

## Handling Duplicates

The system automatically prevents duplicate tools:

- **Same API, Same MCP**: If you try to add the same API to an MCP twice, it will find the existing tool instead of creating a duplicate
- **Unique Names**: If a tool name already exists, the system appends \`_2\`, \`_3\`, etc. to make it unique
- **Smart Detection**: The system checks for existing tools before creating new ones

## Examples

### Example 1: Adding a Weather API

**API Configuration**:
- Name: \`Get Current Weather\`
- Method: \`GET\`
- URL: \`https://api.weather.com/v1/current\`
- Payload Schema: \`{ "city": "string", "unit": "string" }\`

**Result**:
- Tool Name: \`get_current_weather\`
- Input Schema: Matches payload schema
- Mappings: \`city → city\`, \`unit → unit\`

### Example 2: Adding a REST API with URL Parameters

**API Configuration**:
- Name: \`Get User Posts\`
- Method: \`GET\`
- URL: \`/api/users/{userId}/posts\`
- URL Params: \`[{ name: "page", value: "{page}" }]\`
- No Payload Schema

**Result**:
- Tool Name: \`get_user_posts\`
- Input Schema: \`{ userId: string, page: string }\`
- Mappings: \`userId → {userId}\` (URL path), \`page → page\` (URL param)

### Example 3: Adding a POST API

**API Configuration**:
- Name: \`Create User\`
- Method: \`POST\`
- URL: \`https://api.example.com/users\`
- Payload Schema: \`{ "name": "string", "email": "string", "age": "number" }\`

**Result**:
- Tool Name: \`create_user\`
- Input Schema: Matches payload schema with all three fields
- Mappings: All fields mapped directly

## Best Practices

### 1. Review Before Adding

Before adding an API to an MCP:
- ✅ Ensure the API is properly configured
- ✅ Verify the payload schema or URL parameters are correct
- ✅ Check that the API name is descriptive

### 2. Customize After Creation

After automatic creation:
- Edit the tool name if the auto-generated one isn't ideal
- Update the description to be more specific
- Adjust mappings if you need transformations
- Add or remove input schema fields as needed

### 3. Test Immediately

After adding:
- Test the tool with sample inputs
- Verify the API receives the correct data
- Check that responses are formatted correctly

### 4. Organize Your Tools

- Use consistent naming conventions
- Group related tools in the same MCP
- Add clear descriptions to help AI assistants understand when to use each tool

## Troubleshooting

### Tool Created But No Input Schema

**Problem**: Tool shows "No properties defined" warning

**Solutions**:
- Check that your API has a payload schema defined
- If using URL parameters, ensure they have variable placeholders like \`{paramName}\`
- Manually edit the tool to add an input schema

### Mappings Not Working

**Problem**: Tool calls don't reach the API correctly

**Solutions**:
- Verify the API mapping is configured (check the mapping section)
- Ensure field names match between tool and API
- Check that the API is enabled
- Review the mapping configuration

### Duplicate Tool Created

**Problem**: Multiple tools created for the same API

**Solutions**:
- The system should prevent this automatically
- If it happens, delete the duplicate tools
- Check that you're not clicking "Add to MCP" multiple times rapidly

### Tool Name Conflicts

**Problem**: Tool name has \`_2\` or \`_3\` appended

**Solutions**:
- This is automatic when a name already exists
- You can edit the tool name to something more descriptive
- Consider using more specific names to avoid conflicts

## Advanced: Customizing After Creation

After the automatic creation, you have full control:

### Edit Tool Input Schema

1. Go to the MCP detail page
2. Find your tool
3. Click **Edit**
4. Modify the input schema JSON
5. Save changes

### Adjust Field Mappings

1. Find the tool's **API Mapping** section
2. Click **Edit Mapping** or **Add Mapping**
3. Modify field mappings:
   - Change direct mappings
   - Add constant values
   - Add expression transformations
4. Save the mapping

### Add Multiple APIs to One Tool

While "Add to MCP" creates one tool per API, you can:
1. Create a tool manually
2. Add multiple mappings to different APIs
3. Use conditional logic in transformations

## Comparison: Automatic vs Manual

Here's a quick comparison to help you decide:

**Speed**:
- **Add to MCP**: ⚡ Very fast - one click and you're done
- **Manual Creation**: 🐢 Slower - requires multiple steps

**Input Schema**:
- **Add to MCP**: Auto-generated from API payload schema or URL parameters
- **Manual Creation**: You define it manually with full control

**Mappings**:
- **Add to MCP**: One-to-one default mappings (all fields mapped directly)
- **Manual Creation**: Fully customizable from the start

**Best For**:
- **Add to MCP**: Quick setup, prototyping, simple APIs
- **Manual Creation**: Complex requirements, custom transformations, advanced use cases

**Customization**:
- **Add to MCP**: Can customize after creation (edit tool, modify mappings)
- **Manual Creation**: Customize during creation with immediate control

## Conclusion

The "Add to MCP" feature is a powerful way to quickly expose your APIs as MCP tools. It handles all the tedious setup work automatically, letting you focus on what matters: making your APIs accessible to AI assistants.

While the automatic configuration is great for getting started, remember that you can always customize the tool, input schema, and mappings afterward to fit your exact needs.

**Next Steps**:
1. Try adding one of your APIs to an MCP
2. Review the automatically generated tool and mappings
3. Customize as needed for your use case
4. Test the tool with an MCP client

For more information, see our guides on [creating MCP tools manually](/blog/how-to-create-mcp-tools), [understanding mappings](/blog/how-mcp-to-api-mapping-works), and [configuring MCPs](/blog/how-to-configure-mcp-in-admin).`
  },
  {
    slug: 'how-to-make-mcp-private-and-configure-oauth',
    title: 'How to Make an MCP Private and Configure OAuth Authentication',
    description: 'Learn how to secure your MCP servers by making them private, granting access to specific users, and configuring OAuth 2.1 authentication for secure client connections.',
    publishedAt: '2024-01-20',
    author: 'API to MCP Team',
    category: 'Security',
    readingTime: 12,
    content: `# How to Make an MCP Private and Configure OAuth Authentication

When you create an MCP server, you have two visibility options: **public** or **private**. Public MCPs are accessible to everyone, while private MCPs require authentication and explicit access grants. This guide will walk you through making your MCP private, managing user access, and configuring OAuth authentication.

## Understanding MCP Visibility

### Public MCPs
- Accessible to anyone without authentication
- No user management required
- Best for: Public APIs, open data, demo/testing purposes

### Private MCPs
- Require OAuth 2.1 authentication
- Access must be explicitly granted to users
- Best for: Internal APIs, sensitive data, production systems

## Step 1: Making an MCP Private

### During Creation

When creating a new MCP:

1. Navigate to **Admin** → **MCPs** → **Create MCP**
2. Fill in the basic information:
   - **Name**: A descriptive name for your MCP
   - **Slug**: URL-friendly identifier
3. Set **Visibility** to **Private**
4. Click **Create MCP**

### Changing Existing MCP to Private

If you have an existing public MCP:

1. Go to **Admin** → **MCPs**
2. Click **Edit** on the MCP you want to make private
3. Change **Visibility** from **Public** to **Private**
4. Click **Update MCP**

**Important**: Once an MCP is private, only users with explicit access grants will be able to connect to it.

## Step 2: Granting Access to Users

After making an MCP private, you need to grant access to specific users. Only the MCP owner can grant access.

### Finding Users

1. Navigate to your private MCP's detail page
2. Scroll to the **Access Management** section (only visible for private MCPs)
3. Use the user search to find users by email

### Granting Access

1. Enter the user's email address in the search field
2. Click **Grant Access**
3. Optionally set an expiration date (leave blank for permanent access)
4. The user will now be able to authenticate and use the MCP

### Managing Access

In the **Access Management** section, you can:

- **View all users** with access to your MCP
- **Revoke access** by clicking the revoke button next to a user
- **See access details** including:
  - Who granted the access
  - When access was granted
  - Expiration date (if set)
  - Revocation status

### Access Levels

Currently, there are two access levels:

1. **Owner**: The user who created the MCP (always has access)
2. **Granted User**: Users explicitly granted access by the owner

## Step 3: Configuring OAuth for MCP Clients

Once your MCP is private, clients need to authenticate using OAuth 2.1. Here's how to configure different MCP clients.

### For Cursor (Manual Token Method)

Since Cursor may not yet fully support automatic OAuth discovery, you can manually get a token:

#### Option 1: Get Token via Web UI

1. Visit: \`http://localhost:3000/oauth-token/{your-mcp-slug}\`
2. Click **Get Token**
3. Complete the authorization flow:
   - Log in if not already authenticated
   - Grant access to the MCP
   - Receive your access token
4. Copy the token

#### Option 2: Configure Cursor

Create or edit \`.cursor/mcp.json\` in your project:

\`\`\`json
{
  "mcpServers": {
    "your-mcp-slug": {
      "url": "http://localhost:3000/api/mcp/your-mcp-slug",
      "headers": {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
      }
    }
  }
}
\`\`\`

Replace \`YOUR_ACCESS_TOKEN_HERE\` with the token you received.

5. **Restart Cursor** to load the new configuration

**Important**: After updating your MCP configuration or getting a new token, you **must restart Cursor** for the changes to take effect. Cursor caches the MCP configuration when it starts, so configuration changes won't be recognized until you restart the application.

### For Other MCP Clients (Automatic OAuth)

If your client supports automatic OAuth discovery (RFC 9728), configure it without a token:

\`\`\`json
{
  "mcpServers": {
    "your-mcp-slug": {
      "url": "http://localhost:3000/api/mcp/your-mcp-slug"
    }
  }
}
\`\`\`

The client should automatically:
1. Detect the 401 response
2. Parse the \`WWW-Authenticate\` header
3. Discover OAuth endpoints
4. Open browser for authorization
5. Complete the OAuth flow
6. Store and use the token

### Token Expiration and Refresh

**Access tokens** expire after **1 hour**. **Refresh tokens** last **7 days**.

#### Current Behavior

**Important**: After authentication or when your token expires, you **may need to restart Cursor** for the changes to take effect. This is because:

1. Cursor caches MCP configuration and tokens when it starts
2. Some clients don't yet automatically refresh expired tokens
3. Configuration file changes require a restart to be loaded

**When to restart Cursor**:
- After adding or updating your MCP configuration
- After getting a new access token
- When you receive authentication errors
- After granting or revoking access to your MCP

#### Future Improvement

Clients should automatically:
- Detect expired tokens from 401 responses
- Use refresh tokens to get new access tokens
- Retry requests without user intervention

Until then, you can manually refresh tokens by:
1. Visiting the token page again: \`http://localhost:3000/oauth-token/{mcp-slug}\`
2. Getting a new token
3. Updating your client configuration

## Step 4: Understanding the OAuth Flow

Here's what happens behind the scenes when a client connects to your private MCP:

### 1. Initial Request
Client makes a request to the MCP endpoint without authentication.

### 2. 401 Response
Server responds with:
- Status: \`401 Unauthorized\`
- Header: \`WWW-Authenticate: Bearer realm="mcp", resource_metadata="...", scope="mcp:tools mcp:resources"\`

### 3. Discovery
Client fetches OAuth metadata from the resource_metadata URL to discover:
- Authorization endpoint
- Token endpoint
- Supported scopes
- PKCE requirements

### 4. Authorization
Client redirects user to authorization endpoint where they:
- Log in (if not authenticated)
- Grant access (if not already granted)
- Receive authorization code

### 5. Token Exchange
Client exchanges authorization code for access token using PKCE.

### 6. Authenticated Requests
Client uses access token in \`Authorization: Bearer\` header for all subsequent requests.

## Security Best Practices

### For MCP Owners

1. **Grant access selectively**: Only grant access to users who need it
2. **Use expiration dates**: Set expiration dates for temporary access
3. **Monitor access**: Regularly review who has access to your MCPs
4. **Revoke when needed**: Immediately revoke access for users who no longer need it
5. **Use HTTPS in production**: Always use HTTPS for production deployments

### For MCP Users

1. **Protect your tokens**: Never share access tokens publicly
2. **Use secure storage**: Store tokens securely in configuration files
3. **Rotate tokens**: Get new tokens periodically for better security
4. **Report issues**: Report any security concerns to the MCP owner

## Troubleshooting

### "Access denied" Error

**Possible causes**:
- User doesn't have access grant
- Access was revoked
- Access has expired

**Solution**: Contact the MCP owner to grant or renew access.

### "Token expired" Error

**Possible causes**:
- Access token expired (after 1 hour)
- Refresh token expired (after 7 days)

**Solution**: 
- Get a new token from the token page
- Update your client configuration
- Restart your MCP client

### "Invalid token" Error

**Possible causes**:
- Token was revoked
- Token is malformed
- Token is for a different MCP

**Solution**: Get a new token and verify it's for the correct MCP.

### Client Can't Connect

**Possible causes**:
- MCP is disabled
- Incorrect endpoint URL
- Network issues
- Configuration not loaded (needs restart)

**Solution**:
- Verify MCP is enabled in admin panel
- Check the endpoint URL matches the MCP slug
- Verify network connectivity
- **Restart Cursor** - Configuration changes require a restart to take effect

### Authentication Not Working After Configuration

**Possible causes**:
- Token not updated in configuration file
- Cursor hasn't reloaded the configuration
- Token expired

**Solution**:
1. Verify the token is correctly added to \`.cursor/mcp.json\`
2. **Restart Cursor completely** (quit and reopen the application)
3. If still not working, get a fresh token and update the configuration
4. Restart Cursor again after updating the token

## Configuration Examples

### Cursor Configuration (with token)

\`\`\`json
{
  "mcpServers": {
    "my-private-api": {
      "url": "http://localhost:3000/api/mcp/my-private-api",
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
\`\`\`

### Claude Desktop Configuration

\`\`\`json
{
  "mcpServers": {
    "my-private-api": {
      "url": "http://localhost:3000/api/mcp/my-private-api",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
\`\`\`

Save to: \`~/Library/Application Support/Claude/claude_desktop_config.json\`

## API Endpoints Reference

### MCP Endpoint
\`POST http://localhost:3000/api/mcp/{slug}\`

### OAuth Endpoints
- **Authorization**: \`GET http://localhost:3000/api/oauth/{slug}/authorize\`
- **Token**: \`POST http://localhost:3000/api/oauth/{slug}/token\`
- **Token Page**: \`GET http://localhost:3000/oauth-token/{slug}\`
- **Metadata**: \`GET http://localhost:3000/api/oauth/{slug}/.well-known/oauth-protected-resource\`

## Conclusion

Making your MCP private adds an important layer of security, ensuring only authorized users can access your APIs. The OAuth 2.1 flow provides secure authentication while maintaining a good user experience.

**Key Takeaways**:
- Set visibility to **Private** when creating or editing an MCP
- Grant access to specific users through the Access Management section
- Configure clients with OAuth tokens for authentication
- **Always restart Cursor after authentication or configuration changes** - This is required for changes to take effect
- Monitor and manage access regularly for security

**Next Steps**:
1. Make one of your MCPs private
2. Grant access to a test user
3. Configure an MCP client with OAuth
4. Test the authenticated connection

For more information, see our guides on [automatic OAuth flow](/docs/AUTOMATIC_OAUTH.md), [authorization documentation](/docs/AUTHORIZATION.md), and [troubleshooting authentication issues](/docs/TROUBLESHOOTING.md).`
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
