# Route Review - Non-Required Routes

This document identifies routes that are not required for the core functionality of the application.

## Debug Routes (Development/Testing Only)

~~These routes have been removed.~~ ✅ **REMOVED**

### ~~1. `/api/debug/access/[mcpSlug]`~~ ✅ **REMOVED**
- ~~**Location**: `app/api/debug/access/[mcpSlug]/route.ts`~~
- ~~**Purpose**: Debug endpoint to check MCP access permissions~~

### ~~2. `/api/debug/tokens/[mcpSlug]`~~ ✅ **REMOVED**
- ~~**Location**: `app/api/debug/tokens/[mcpSlug]/route.ts`~~
- ~~**Purpose**: Debug endpoint to check stored OAuth tokens~~

### ~~3. `/api/oauth/[mcpSlug]/debug`~~ ✅ **REMOVED**
- ~~**Location**: `app/api/oauth/[mcpSlug]/debug/route.ts`~~
- ~~**Purpose**: Debug endpoint for OAuth flow troubleshooting with example values~~

## Admin Routes (Not Linked/Navigation)

These routes exist but are not linked in the navigation or used anywhere:

### 4. `/admin/settings`
- **Location**: `app/admin/settings/page.tsx`
- **Purpose**: Settings page with hardcoded placeholder data
- **Status**: ⚠️ **Not Required** - Not linked in navigation, contains placeholder content
- **Recommendation**: Remove if not planned, or implement proper settings functionality
- **Issues**: 
  - Hardcoded mock data (Site Name, Site URL, Timezone)
  - Non-functional buttons (Save Changes, Reset to Defaults)
  - Not accessible from admin navigation sidebar

### 5. `/admin/users`
- **Location**: `app/admin/users/page.tsx`
- **Purpose**: Users management page with hardcoded mock data
- **Status**: ⚠️ **Not Required** - Not linked in navigation, contains mock data
- **Recommendation**: Remove if not planned, or implement proper user management
- **Issues**:
  - Hardcoded mock users (John Doe, Jane Smith, Bob Johnson)
  - Non-functional "Add User" and "Edit" buttons
  - Not accessible from admin navigation sidebar

## Potentially Redundant Routes

### 6. `/authorize/[mcpSlug]`
- **Location**: `app/authorize/[mcpSlug]/page.tsx`
- **Purpose**: OAuth authorization UI page
- **Status**: ⚠️ **Potentially Redundant** - May not be used
- **Analysis**: 
  - There's also `/authorize/route.ts` that redirects to `/api/oauth/[mcpSlug]/authorize`
  - The page component redirects to `/api/oauth/[mcpSlug]/authorize` anyway
  - The actual OAuth flow happens in `/api/oauth/[mcpSlug]/authorize/route.ts`
- **Recommendation**: Verify if this page is actually accessed. If not, remove it.

### 7. `/.well-known/[...path]`
- **Location**: `app/.well-known/[...path]/route.ts`
- **Purpose**: Catch-all route for incorrectly constructed OAuth discovery requests
- **Status**: ⚠️ **Optional** - Helper for client compatibility
- **Recommendation**: Keep if you want to support clients that construct discovery URLs incorrectly, otherwise remove

## Summary

### Routes Removed:
1. ✅ `/api/debug/access/[mcpSlug]` - Debug only (REMOVED)
2. ✅ `/api/debug/tokens/[mcpSlug]` - Debug only (REMOVED)
3. ✅ `/api/oauth/[mcpSlug]/debug` - Debug only (REMOVED)

### Routes to Remove (High Priority):
4. `/admin/settings` - Not linked, placeholder content
5. `/admin/users` - Not linked, mock data

### Routes to Verify (Medium Priority):
6. `/authorize/[mcpSlug]` - Check if actually used
7. `/.well-known/[...path]` - Optional compatibility helper

### Required Routes (Keep):
- `/` - Home page
- `/login` - Authentication
- `/admin` - Admin dashboard
- `/admin/mcps` - MCP management
- `/admin/api` - API management
- `/blog` - Blog pages
- `/learn-more` - Marketing page
- `/oauth-token/[mcpSlug]` - OAuth token UI (used)
- `/oauth-token/[mcpSlug]/callback` - OAuth callback (used)
- `/authorize/route.ts` - OAuth redirect helper (used)
- All `/api/mcp/*` routes - Core MCP functionality
- All `/api/oauth/*` routes (except debug) - OAuth flow

## Action Items

1. ✅ **Remove debug routes** - COMPLETED
   - Removed `/api/debug/access/[mcpSlug]`
   - Removed `/api/debug/tokens/[mcpSlug]`
   - Removed `/api/oauth/[mcpSlug]/debug`
   - Cleaned up debug URL references in error messages
2. **Remove or implement** `/admin/settings` and `/admin/users`
3. **Verify usage** of `/authorize/[mcpSlug]/page.tsx` before removing
