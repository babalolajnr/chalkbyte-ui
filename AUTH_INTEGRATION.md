# Authentication Integration Guide

## Overview

This document describes the authentication integration for the Chalkbyte UI application. The authentication system supports:

- Email/password login
- Multi-factor authentication (MFA) with TOTP
- Recovery codes for account recovery
- Password reset functionality
- JWT token-based authentication
- Role-based access control

## Architecture

### Directory Structure

```
src/lib/
├── services/
│   └── auth.service.ts       # API client for authentication endpoints
├── stores/
│   └── auth.store.ts         # Svelte store for authentication state
├── types/
│   └── auth.ts               # TypeScript type definitions
├── guards/
│   └── auth.guard.ts         # Route protection utilities
└── components/
    ├── login-form.svelte     # Login form component
    └── otp-form.svelte       # MFA verification component
```

### Routes

- `/login` - User login page
- `/otp` - MFA verification page
- `/password-reset` - Password reset request page

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://api.chalkbyte.com
```

### API Base URL

The API base URL can be configured via the `VITE_API_BASE_URL` environment variable. If not set, it defaults to `https://api.chalkbyte.com`.

## Usage

### Login Flow

1. User enters email and password on `/login`
2. If MFA is not enabled:
   - User receives JWT token and is redirected to home
3. If MFA is enabled:
   - User receives temp token and is redirected to `/otp`
   - User enters 6-digit TOTP code from authenticator app
   - Upon verification, user receives JWT token and is redirected to home

### Authentication Store

The authentication store manages the global auth state:

```typescript
import { authStore } from '$lib/stores/auth.store';

// Initialize auth on app load (already done in +layout.svelte)
authStore.initialize();

// Set user after successful login
authStore.setUser(user, accessToken);

// Set MFA required state
authStore.setMFARequired(tempToken);

// Logout
authStore.logout();

// Subscribe to auth state
authStore.subscribe((state) => {
  console.log(state.user);
  console.log(state.isAuthenticated);
});
```

### Using Derived Stores

```typescript
import { isAuthenticated, currentUser, isLoading, mfaRequired } from '$lib/stores/auth.store';

// In your Svelte component
<script>
  import { isAuthenticated, currentUser } from '$lib/stores/auth.store';
</script>

{#if $isAuthenticated}
  <p>Welcome, {$currentUser?.first_name}!</p>
{/if}
```

### Authentication Service

The `authService` provides methods for all authentication operations:

```typescript
import { authService } from '$lib/services/auth.service';

// Login
const response = await authService.login({ email, password });

// Verify MFA
const response = await authService.verifyMFA({ code, temp_token });

// Login with recovery code
const response = await authService.loginWithRecoveryCode({ recovery_code, temp_token });

// Request password reset
await authService.requestPasswordReset({ email });

// Reset password with token
await authService.resetPassword({ token, new_password });

// Enable MFA
const response = await authService.enableMFA();

// Verify MFA setup
const response = await authService.verifyMFASetup({ code });

// Disable MFA
await authService.disableMFA({ password });

// Get MFA status
const response = await authService.getMFAStatus();

// Regenerate recovery codes
const response = await authService.regenerateRecoveryCodes();

// Logout
authService.logout();
```

### Route Protection

Use the auth guards to protect routes:

```typescript
import { requireAuth, requireGuest, requireRole } from '$lib/guards/auth.guard';
import { onMount } from 'svelte';

// Require authentication
onMount(() => {
  requireAuth();
});

// Require guest (not authenticated)
onMount(() => {
  requireGuest();
});

// Require specific role
onMount(() => {
  requireRole(['admin', 'teacher']);
});
```

## API Endpoints

### Authentication

- `POST /auth/login` - Login with email/password
- `POST /auth/mfa/verify` - Verify MFA code
- `POST /auth/recovery` - Login with recovery code
- `POST /auth/password-reset` - Request password reset email
- `POST /auth/password-reset/confirm` - Reset password with token

### MFA Management

- `GET /auth/mfa/status` - Get MFA enrollment status
- `POST /auth/mfa/enable` - Enable MFA and get QR code
- `POST /auth/mfa/verify-setup` - Verify MFA setup with TOTP code
- `POST /auth/mfa/disable` - Disable MFA with password confirmation
- `POST /auth/mfa/recovery-codes` - Regenerate recovery codes

## Data Types

### User Object

```typescript
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student';
  school_id: string;
}
```

### Auth State

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempToken: string | null;
  mfaRequired: boolean;
}
```

## Token Storage

JWT access tokens are stored in `localStorage` under the key `access_token`. The token is automatically included in the `Authorization` header for authenticated requests.

## Error Handling

All API errors are caught and displayed to the user. The error response format:

```typescript
interface ErrorResponse {
  error: string;
}
```

Example error handling:

```typescript
try {
  await authService.login({ email, password });
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'An error occurred';
  // Display error to user
}
```

## Security Considerations

1. **Token Storage**: Access tokens are stored in localStorage. For production, consider using httpOnly cookies for enhanced security.

2. **HTTPS**: Always use HTTPS in production to protect credentials in transit.

3. **Token Expiration**: Implement token refresh logic when the API supports it.

4. **XSS Protection**: The application uses SvelteKit's built-in XSS protection.

5. **CSRF Protection**: For cookie-based authentication, implement CSRF tokens.

## Future Enhancements

- [ ] Implement token refresh mechanism
- [ ] Add biometric authentication support
- [ ] Implement session management
- [ ] Add OAuth providers (Google, GitHub, etc.)
- [ ] Implement "Remember Me" functionality
- [ ] Add email verification for new accounts
- [ ] Implement account lockout after failed attempts