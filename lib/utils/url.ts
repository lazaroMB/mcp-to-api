import { NextRequest } from 'next/server';

/**
 * Get the base URL for the application
 * Prioritizes NEXT_PUBLIC_APP_URL environment variable, then checks if we're on the custom domain,
 * and falls back to the request origin or localhost for development.
 * 
 * This ensures that OAuth URLs and MCP endpoints always use the correct domain (api-to-mcp.dev)
 * instead of Vercel preview URLs.
 */
export function getBaseUrl(request?: NextRequest | { nextUrl: { origin: string } } | null): string {
  // 1. Check for explicit environment variable (highest priority)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. If we have a request, check if it's using the custom domain
  if (request) {
    const origin = request.nextUrl.origin;
    // If the origin is the custom domain, use it
    if (origin.includes('api-to-mcp.dev')) {
      return origin;
    }
    // If it's a Vercel preview URL, prefer the custom domain
    if (origin.includes('vercel.app')) {
      // Return the custom domain instead of the preview URL
      return 'https://api-to-mcp.dev';
    }
    // For localhost or other origins, use as-is
    return origin;
  }

  // 3. Client-side fallback
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If on custom domain, use it
    if (origin.includes('api-to-mcp.dev')) {
      return origin;
    }
    // If on Vercel preview, prefer custom domain
    if (origin.includes('vercel.app')) {
      return 'https://api-to-mcp.dev';
    }
    return origin;
  }

  // 4. Server-side fallback without request (shouldn't happen often)
  if (process.env.VERCEL_URL) {
    // Check if it's the production deployment
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl.includes('api-to-mcp')) {
      return `https://${vercelUrl}`;
    }
    // Otherwise prefer custom domain over preview URL
    return 'https://api-to-mcp.dev';
  }

  // 5. Development fallback
  return 'http://localhost:3000';
}
