# Quick Start Guide - Authentication Integration

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to the Chalkbyte API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:

```env
VITE_API_BASE_URL=https://api.chalkbyte.com
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Testing the Authentication Flow

### 1. Login Page

Navigate to `http://localhost:5173/login`

**Test Login:**
- Enter your email and password
- Click "Login"
- If MFA is disabled: You'll be redirected to the dashboard
- If MFA is enabled: You'll be redirected to the OTP page

### 2. MFA Verification (if enabled)

On the OTP page (`/otp`):
- Enter the 6-digit code from your authenticator app
- Or click "Use recovery code" to enter a recovery code instead
- Click "Verify" to complete login

### 3. Password Reset

Navigate to `http://localhost:5173/password-reset`

- Enter your email address
- Click "Send Reset Link"
- Check your email for the reset link

### 4. Dashboard

After successful login, you'll be redirected to `/dashboard`

The dashboard displays:
- Your profile information
- Security settings options
- Quick action links

## Available Routes

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Home page | No |
| `/login` | Login page | Guest only |
| `/otp` | MFA verification | Guest only |
| `/password-reset` | Password reset request | Guest only |
| `/dashboard` | User dashboard | Yes |

## Using Authentication in Your Components

### Check Authentication Status

```svelte
<script>
  import { isAuthenticated, currentUser } from '$lib/stores/auth.store';
</script>

{#if $isAuthenticated}
  <p>Welcome, {$currentUser?.first_name}!</p>
  <p>Role: {$currentUser?.role}</p>
{:else}
  <a href="/login">Please login</a>
{/if}
```

### Protect a Route

```svelte
<script>
  import { onMount } from 'svelte';
  import { requireAuth } from '$lib/guards/auth.guard';

  onMount(() => {
    requireAuth(); // Redirects to /login if not authenticated
  });
</script>

<h1>Protected Content</h1>
```

### Role-Based Access

```svelte
<script>
  import { onMount } from 'svelte';
  import { requireRole } from '$lib/guards/auth.guard';

  onMount(() => {
    requireRole(['admin', 'teacher']); // Only allow admin or teacher
  });
</script>

<h1>Admin/Teacher Only Content</h1>
```

### Make API Calls

```svelte
<script>
  import { authService } from '$lib/services/auth.service';
  
  async function checkMFAStatus() {
    try {
      const status = await authService.getMFAStatus();
      console.log('MFA enabled:', status.mfa_enabled);
    } catch (error) {
      console.error('Failed to get MFA status:', error);
    }
  }
</script>
```

### Logout

```svelte
<script>
  import { authStore } from '$lib/stores/auth.store';
  import { goto } from '$app/navigation';

  function handleLogout() {
    authStore.logout();
    goto('/login');
  }
</script>

<button onclick={handleLogout}>Logout</button>
```

## Common Use Cases

### 1. Display User Information

```svelte
<script>
  import { currentUser } from '$lib/stores/auth.store';
  import { getFullName, getInitials } from '$lib/auth-utils';
</script>

<div>
  <div class="avatar">{getInitials($currentUser)}</div>
  <p>{getFullName($currentUser)}</p>
  <p>{$currentUser?.email}</p>
</div>
```

### 2. Conditional Navigation

```svelte
<script>
  import { isAuthenticated } from '$lib/stores/auth.store';
</script>

<nav>
  <a href="/">Home</a>
  {#if $isAuthenticated}
    <a href="/dashboard">Dashboard</a>
    <a href="/profile">Profile</a>
  {:else}
    <a href="/login">Login</a>
    <a href="/signup">Sign Up</a>
  {/if}
</nav>
```

### 3. Role-Based UI

```svelte
<script>
  import { currentUser } from '$lib/stores/auth.store';
  import { isAdmin, isTeacher } from '$lib/auth-utils';
</script>

{#if isAdmin($currentUser)}
  <button>Admin Panel</button>
{/if}

{#if isTeacher($currentUser) || isAdmin($currentUser)}
  <button>Create Course</button>
{/if}
```

## Troubleshooting

### "Cannot connect to API"

- Check that `VITE_API_BASE_URL` is set correctly in `.env`
- Verify the API server is running and accessible
- Check browser console for CORS errors

### "Token expired" errors

- The JWT token may have expired
- Logout and login again
- Future: Implement automatic token refresh

### MFA page redirects to login

- This happens if there's no temp token
- Make sure you're coming from the login page
- The temp token is required for MFA verification

### Protected routes not working

- Make sure you call `requireAuth()` in `onMount()`
- Check that the auth store is initialized in `+layout.svelte`
- Verify the token is stored in localStorage

## Next Steps

1. **Customize the UI** - Update the login and OTP forms to match your brand
2. **Add More Protected Routes** - Create additional pages with auth guards
3. **Implement MFA Setup** - Add pages for enabling/disabling MFA
4. **Add Profile Management** - Create profile editing functionality
5. **Implement Token Refresh** - Add automatic token refresh logic
6. **Add Session Management** - Track user sessions and activity
7. **Enhance Security** - Implement additional security measures

## Documentation

- **Full Integration Guide**: See `AUTH_INTEGRATION.md`
- **Integration Summary**: See `INTEGRATION_SUMMARY.md`
- **API Documentation**: Refer to the original `auth.md` specification

## Support

For issues or questions:
1. Check the documentation files in the project root
2. Review the API specification
3. Check browser console for error messages
4. Verify environment variables are set correctly