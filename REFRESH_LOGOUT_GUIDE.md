# Refresh Token and Logout Guide

This guide explains how to use the refresh token and logout functionality in the Chalkbyte UI application.

## Overview

The application now supports:
- **Automatic token refresh** - Keeps users logged in by refreshing access tokens before they expire
- **Manual token refresh** - Programmatically refresh tokens when needed
- **Secure logout** - Revokes all refresh tokens on the server and clears local storage

## API Endpoints

### Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Body**: `{ "refresh_token": "string" }`
- **Response**: Returns new access token, refresh token, and user data

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Headers**: Requires `Authorization: Bearer <access_token>`
- **Response**: Confirmation message

## Usage

### 1. Logout Functionality

#### Using the LogoutButton Component

```typescript
import { LogoutButton } from '$lib/components';

<LogoutButton />
```

#### Using the useLogout Hook

```typescript
import { useLogout } from '$lib/queries/auth.queries';

const logoutMutation = useLogout();

function handleLogout() {
  logoutMutation.mutate();
}
```

The logout mutation:
- Calls the logout API endpoint
- Clears local storage (access token and refresh token)
- Resets the auth store
- Redirects to `/login`
- Handles errors gracefully by clearing local state even if the API call fails

### 2. Manual Token Refresh

#### Using the useRefreshToken Hook

```typescript
import { useRefreshToken } from '$lib/queries/auth.queries';

const refreshMutation = useRefreshToken();

function handleRefresh() {
  refreshMutation.mutate();
}
```

The refresh mutation:
- Retrieves the stored refresh token
- Calls the refresh API endpoint
- Updates the auth store with new tokens
- Redirects to `/login` if refresh fails

### 3. Automatic Token Refresh

#### Using the TokenRefresh Component

Add this component to your root layout to enable automatic token refresh:

```svelte
<script>
  import { TokenRefresh } from '$lib/components';
</script>

<TokenRefresh />

<!-- Your app content -->
```

The component:
- Only runs when user is authenticated
- Checks token expiration every 4 minutes (configurable)
- Automatically refreshes tokens 5 minutes before expiration
- Logs out user if refresh fails

#### Manual Setup with setupTokenRefresh

```typescript
import { setupTokenRefresh } from '$lib/auth-utils';
import { onMount, onDestroy } from 'svelte';

let cleanup: (() => void) | null = null;

onMount(() => {
  // Check every 4 minutes (default)
  cleanup = setupTokenRefresh();
  
  // Or customize the interval (in milliseconds)
  // cleanup = setupTokenRefresh(5 * 60 * 1000); // 5 minutes
});

onDestroy(() => {
  if (cleanup) {
    cleanup();
  }
});
```

### 4. Utility Functions

#### Check if Token Should Refresh

```typescript
import { shouldRefreshToken } from '$lib/auth-utils';

const token = localStorage.getItem('access_token');
const needsRefresh = shouldRefreshToken(token);

if (needsRefresh) {
  // Trigger refresh
}
```

#### Manual Token Refresh

```typescript
import { autoRefreshToken } from '$lib/auth-utils';

const success = await autoRefreshToken();
if (!success) {
  // User was logged out
}
```

## Implementation Details

### Token Storage

Tokens are stored in localStorage:
- `access_token` - Short-lived JWT for API authentication
- `refresh_token` - Long-lived token for obtaining new access tokens

### Auth Store Updates

The auth store now includes:
- `refreshToken: string | null` - Stores the current refresh token
- Updated `setUser()` method accepts optional refresh token parameter
- `logout()` method clears both tokens from localStorage

### Service Layer

#### AuthService Methods

```typescript
// Refresh access token
async refreshToken(): Promise<RefreshTokenResponse>

// Logout and revoke tokens
async logout(): Promise<LogoutResponse>

// Clear tokens from storage (client-side only)
clearTokens(): void
```

### Login Flow Updates

All login methods now store refresh tokens:
- Regular login (`useLogin`)
- MFA verification (`useVerifyMFA`)
- Recovery code login (`useLoginWithRecoveryCode`)

## Best Practices

1. **Use TokenRefresh Component**: Add `<TokenRefresh />` to your root layout for automatic token management
2. **Handle Logout Errors**: The logout mutation handles errors gracefully, but you can add custom error handling if needed
3. **Customize Refresh Interval**: Adjust the refresh check interval based on your access token expiration time
4. **Secure Token Storage**: Tokens are stored in localStorage. For production apps, consider additional security measures

## Example: Complete Setup

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { TokenRefresh, LogoutButton } from '$lib/components';
  import { isAuthenticated } from '$lib/stores/auth.store';
</script>

<TokenRefresh />

<nav>
  {#if $isAuthenticated}
    <LogoutButton />
  {/if}
</nav>

<slot />
```

## Troubleshooting

### Tokens Not Refreshing
- Check that `<TokenRefresh />` is added to your layout
- Verify the access token has an `exp` claim in its JWT payload
- Check browser console for errors

### Logout Not Working
- Ensure the API endpoint is accessible
- Check that the access token is valid
- Verify network connectivity

### Automatic Redirects
- Both logout and failed refresh redirect to `/login`
- This is intentional to ensure security
- Customize by modifying the mutation's `onError` and `onSuccess` callbacks