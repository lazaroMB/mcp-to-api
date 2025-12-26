import { API, KeyValuePair } from '@/lib/types/api';

export interface APIRequestOptions {
  payload?: Record<string, any>;
}

export interface APIResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

/**
 * Builds and executes an API request based on API configuration
 */
export async function callMappedAPI(
  api: API,
  options: APIRequestOptions = {}
): Promise<APIResponse> {
  // Build URL with query parameters
  let url = api.url;
  if (api.url_params && api.url_params.length > 0) {
    const params = new URLSearchParams();
    api.url_params.forEach((param: KeyValuePair) => {
      if (param.name && param.value) {
        params.append(param.name, param.value);
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (api.headers && api.headers.length > 0) {
    api.headers.forEach((header: KeyValuePair) => {
      if (header.name && header.value) {
        headers[header.name] = header.value;
      }
    });
  }

  // Build cookies
  if (api.cookies && api.cookies.length > 0) {
    const cookieHeader = api.cookies
      .map((cookie: KeyValuePair) => {
        if (cookie.name && cookie.value) {
          return `${cookie.name}=${cookie.value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('; ');

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
  }

  // Determine if we need a body
  const needsBody = ['POST', 'PUT', 'PATCH'].includes(api.method);
  const body = needsBody && options.payload
    ? JSON.stringify(options.payload)
    : undefined;

  // Make the request
  try {
    const response = await fetch(url, {
      method: api.method,
      headers,
      body,
    });

    // Handle different response types
    let responseData: any;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else if (contentType.includes('text/')) {
      responseData = await response.text().catch(() => null);
    } else {
      // For other types, try to get as blob or text
      responseData = await response.text().catch(() => null);
    }

    // Convert headers to plain object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      data: responseData,
      headers: responseHeaders,
    };
  } catch (error) {
    // Enhanced error handling
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Network error: Failed to connect to API at ${url}. Check if the URL is correct and accessible.`
      );
    }
    throw new Error(
      `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
