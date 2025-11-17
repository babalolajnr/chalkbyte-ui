# TanStack Query Setup

This project uses TanStack Query (Svelte Query) for server state management and API request handling.

## Overview

TanStack Query provides:
- Automatic caching and background refetching
- Loading and error states
- Optimistic updates
- Request deduplication
- Built-in retry logic

## Configuration

### QueryClient Setup

The QueryClient is configured in `src/routes/+layout.ts`:

```typescript
import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export async function load() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser, // Only run queries in browser
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });

  return { queryClient };
}
```

### Provider Integration

The QueryClientProvider wraps the app in `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import type { LayoutData } from './$types';

  let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<QueryClientProvider client={data.queryClient}>
  {@render children()}
</QueryClientProvider>
```

## Auth Query Hooks

All authentication queries and mutations are defined in `src/lib/queries/auth.queries.ts`.

### Query Keys

```typescript
export const authKeys = {
  all: ['auth'] as const,
  mfaStatus: () => [...authKeys.all, 'mfa-status'] as const
};
```

### Queries

#### useMFAStatus

Fetches the current MFA status for the authenticated user.

```typescript
const mfaStatusQuery = useMFAStatus();

// Access data
$mfaStatusQuery.data?.mfa_enabled

// Check states
$mfaStatusQuery.isLoading
$mfaStatusQuery.isError
$mfaStatusQuery.error

// Refetch manually
$mfaStatusQuery.refetch()
```

### Mutations

#### useLogin

Handles user login with email and password.

```typescript
const loginMutation = useLogin();

// Execute mutation
$loginMutation.mutate({ email, password });

// Check states
$loginMutation.isPending
$loginMutation.isError
$loginMutation.isSuccess
$loginMutation.error

// Reset mutation state
$loginMutation.reset()
```

**Automatic navigation:** On success, automatically redirects to `/otp` if MFA is required, or `/dashboard` if login is complete.

#### useVerifyMFA

Verifies MFA code during login.

```typescript
const verifyMFAMutation = useVerifyMFA();

$verifyMFAMutation.mutate({ code, temp_token });
```

**Automatic navigation:** On success, redirects to `/dashboard`.

#### useLoginWithRecoveryCode

Login using a recovery code instead of MFA code.

```typescript
const recoveryCodeMutation = useLoginWithRecoveryCode();

$recoveryCodeMutation.mutate({ recovery_code, temp_token });
```

#### useRequestPasswordReset

Request a password reset email.

```typescript
const resetMutation = useRequestPasswordReset();

$resetMutation.mutate({ email });

// Check success
if ($resetMutation.isSuccess) {
  // Show success message
}
```

#### useResetPassword

Reset password using token from email.

```typescript
const resetMutation = useResetPassword();

$resetMutation.mutate({ token, new_password });
```

**Automatic navigation:** On success, redirects to `/login`.

#### useEnableMFA

Enable MFA for the current user.

```typescript
const enableMFAMutation = useEnableMFA();

$enableMFAMutation.mutate(undefined, {
  onSuccess: (response) => {
    // response.qr_code_url
    // response.manual_entry_key
  }
});
```

#### useVerifyMFASetup

Verify MFA setup with code from authenticator app.

```typescript
const verifyMFASetupMutation = useVerifyMFASetup();

$verifyMFASetupMutation.mutate({ code }, {
  onSuccess: (response) => {
    // response.recovery_codes
  }
});
```

#### useDisableMFA

Disable MFA for the current user.

```typescript
const disableMFAMutation = useDisableMFA();

$disableMFAMutation.mutate({ password });
```

#### useRegenerateRecoveryCodes

Generate new recovery codes (invalidates old ones).

```typescript
const regenerateCodesMutation = useRegenerateRecoveryCodes();

$regenerateCodesMutation.mutate(undefined, {
  onSuccess: (response) => {
    // response.recovery_codes
  }
});
```

## Usage Examples

### Basic Query Usage

```svelte
<script lang="ts">
  import { useMFAStatus } from '$lib/queries/auth.queries';

  const mfaStatusQuery = useMFAStatus();
</script>

{#if $mfaStatusQuery.isLoading}
  <p>Loading...</p>
{:else if $mfaStatusQuery.isError}
  <p>Error: {$mfaStatusQuery.error.message}</p>
{:else if $mfaStatusQuery.data}
  <p>MFA is {$mfaStatusQuery.data.mfa_enabled ? 'enabled' : 'disabled'}</p>
{/if}
```

### Basic Mutation Usage

```svelte
<script lang="ts">
  import { useLogin } from '$lib/queries/auth.queries';

  let email = $state('');
  let password = $state('');

  const loginMutation = useLogin();

  function handleSubmit(e: Event) {
    e.preventDefault();
    $loginMutation.mutate({ email, password });
  }
</script>

<form onsubmit={handleSubmit}>
  {#if $loginMutation.isError}
    <div class="error">
      {$loginMutation.error?.message || 'Login failed'}
    </div>
  {/if}

  <input type="email" bind:value={email} />
  <input type="password" bind:value={password} />
  
  <button type="submit" disabled={$loginMutation.isPending}>
    {$loginMutation.isPending ? 'Logging in...' : 'Login'}
  </button>
</form>
```

### Mutation with Callbacks

```svelte
<script lang="ts">
  import { useEnableMFA } from '$lib/queries/auth.queries';

  const enableMFAMutation = useEnableMFA();

  function handleEnable() {
    $enableMFAMutation.mutate(undefined, {
      onSuccess: (response) => {
        console.log('QR Code:', response.qr_code_url);
        // Handle success
      },
      onError: (error) => {
        console.error('Failed to enable MFA:', error);
      }
    });
  }
</script>

<button onclick={handleEnable} disabled={$enableMFAMutation.isPending}>
  Enable MFA
</button>
```

### Manual Refetch

```svelte
<script lang="ts">
  import { useMFAStatus } from '$lib/queries/auth.queries';

  const mfaStatusQuery = useMFAStatus();

  function refresh() {
    $mfaStatusQuery.refetch();
  }
</script>

<button onclick={refresh}>Refresh Status</button>
```

### Derived State

```svelte
<script lang="ts">
  import { useVerifyMFA, useLoginWithRecoveryCode } from '$lib/queries/auth.queries';

  const verifyMFAMutation = useVerifyMFA();
  const recoveryCodeMutation = useLoginWithRecoveryCode();

  // Combine loading states
  const isLoading = $derived(
    $verifyMFAMutation.isPending || $recoveryCodeMutation.isPending
  );

  // Combine error messages
  const error = $derived(
    $verifyMFAMutation.error?.message || 
    $recoveryCodeMutation.error?.message || 
    ''
  );
</script>

{#if isLoading}
  <p>Processing...</p>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}
```

## SSR Considerations

- Queries are disabled on the server via `enabled: browser` in the QueryClient config
- This prevents queries from running during SSR
- Queries only execute client-side after hydration
- For SSR data fetching, use SvelteKit's load functions with `queryClient.prefetchQuery()`

## Best Practices

1. **Query Keys**: Use consistent query keys for proper caching
2. **Error Handling**: Always handle error states in the UI
3. **Loading States**: Show loading indicators during mutations
4. **Reset Mutations**: Reset mutation state when appropriate (e.g., closing modals)
5. **Optimistic Updates**: Consider optimistic updates for better UX
6. **Refetch**: Manually refetch queries after mutations that change data

## Migration from Direct Service Calls

Before (direct service call):
```typescript
let isLoading = $state(false);
let error = $state('');

async function handleSubmit() {
  isLoading = true;
  error = '';
  try {
    const response = await authService.login({ email, password });
    // Handle response
  } catch (err) {
    error = err.message;
  } finally {
    isLoading = false;
  }
}
```

After (TanStack Query):
```typescript
const loginMutation = useLogin();

function handleSubmit() {
  $loginMutation.mutate({ email, password });
}

// Access states via mutation
$loginMutation.isPending
$loginMutation.isError
$loginMutation.error?.message
```

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Svelte Query Adapter](https://tanstack.com/query/latest/docs/svelte/overview)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)