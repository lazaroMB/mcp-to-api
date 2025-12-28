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
