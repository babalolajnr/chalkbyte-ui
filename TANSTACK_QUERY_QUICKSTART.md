# TanStack Query Quick Start Guide

Quick reference for using TanStack Query in the Chalkbyte UI project.

## Installation

TanStack Query is already installed:
```bash
npm install @tanstack/svelte-query
```

## Setup Complete ✓

The following setup is already configured:

1. **QueryClient** in `src/routes/+layout.ts`
2. **QueryClientProvider** in `src/routes/+layout.svelte`
3. **Auth query hooks** in `src/lib/queries/auth.queries.ts`

## Using Queries

### 1. Import the hook

```typescript
import { useMFAStatus } from '$lib/queries/auth.queries';
```

### 2. Create the query

```typescript
const mfaStatusQuery = useMFAStatus();
```

### 3. Use in template

```svelte
{#if $mfaStatusQuery.isLoading}
  <p>Loading...</p>
{:else if $mfaStatusQuery.isError}
  <p>Error: {$mfaStatusQuery.error.message}</p>
{:else if $mfaStatusQuery.data}
  <p>Status: {$mfaStatusQuery.data.mfa_enabled}</p>
{/if}
```

## Using Mutations

### 1. Import the hook

```typescript
import { useLogin } from '$lib/queries/auth.queries';
```

### 2. Create the mutation

```typescript
const loginMutation = useLogin();
```

### 3. Trigger the mutation

```typescript
function handleSubmit(e: Event) {
  e.preventDefault();
  $loginMutation.mutate({ email, password });
}
```

### 4. Check mutation states

```svelte
{#if $loginMutation.isPending}
  <button disabled>Logging in...</button>
{:else}
  <button>Login</button>
{/if}

{#if $loginMutation.isError}
  <div class="error">{$loginMutation.error?.message}</div>
{/if}

{#if $loginMutation.isSuccess}
  <div class="success">Login successful!</div>
{/if}
```

## Available Auth Hooks

### Queries
- `useMFAStatus()` - Get MFA status

### Mutations
- `useLogin()` - Login with email/password
- `useVerifyMFA()` - Verify MFA code
- `useLoginWithRecoveryCode()` - Login with recovery code
- `useRequestPasswordReset()` - Request password reset
- `useResetPassword()` - Reset password with token
- `useEnableMFA()` - Enable MFA
- `useVerifyMFASetup()` - Verify MFA setup
- `useDisableMFA()` - Disable MFA
- `useRegenerateRecoveryCodes()` - Regenerate recovery codes

## Common Patterns

### Manual Refetch

```typescript
const query = useMFAStatus();

function refresh() {
  $query.refetch();
}
```

### Reset Mutation State

```typescript
const mutation = useLogin();

function reset() {
  $mutation.reset();
}
```

### Mutation with Callbacks

```typescript
const mutation = useEnableMFA();

function handleEnable() {
  $mutation.mutate(undefined, {
    onSuccess: (data) => {
      console.log('Success:', data);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });
}
```

### Derived Loading State

```typescript
const mutation1 = useVerifyMFA();
const mutation2 = useLoginWithRecoveryCode();

const isLoading = $derived(
  $mutation1.isPending || $mutation2.isPending
);
```

### Combined Error Messages

```typescript
const mutation1 = useVerifyMFA();
const mutation2 = useLoginWithRecoveryCode();

const errorMessage = $derived(
  $mutation1.error?.message || 
  $mutation2.error?.message || 
  ''
);
```

## Query States

All queries provide these reactive states:
- `$query.data` - The query result
- `$query.isLoading` - Initial loading state
- `$query.isFetching` - Loading state (including refetch)
- `$query.isError` - Error occurred
- `$query.error` - Error object
- `$query.isSuccess` - Query succeeded

## Mutation States

All mutations provide these reactive states:
- `$mutation.isPending` - Mutation in progress
- `$mutation.isError` - Mutation failed
- `$mutation.isSuccess` - Mutation succeeded
- `$mutation.error` - Error object
- `$mutation.data` - Response data

## Creating New Query Hooks

### For Queries (GET requests)

```typescript
export function useMyQuery() {
  return createQuery(() => ({
    queryKey: ['my-query'],
    queryFn: () => myService.getData(),
    enabled: !!someCondition // optional
  }));
}
```

### For Mutations (POST/PUT/DELETE)

```typescript
export function useMyMutation() {
  return createMutation(() => ({
    mutationFn: (data: MyData) => myService.postData(data),
    onSuccess: (response) => {
      // Handle success
    }
  }));
}
```

## Best Practices

1. **Always handle loading states**
   ```svelte
   {#if $query.isLoading}
     <Spinner />
   {/if}
   ```

2. **Always handle error states**
   ```svelte
   {#if $query.isError}
     <Error message={$query.error?.message} />
   {/if}
   ```

3. **Disable buttons during mutations**
   ```svelte
   <button disabled={$mutation.isPending}>Submit</button>
   ```

4. **Reset mutations when appropriate**
   ```typescript
   function closeModal() {
     $mutation.reset();
   }
   ```

5. **Refetch queries after mutations**
   ```typescript
   $mutation.mutate(data, {
     onSuccess: () => {
       $query.refetch();
     }
   });
   ```

## Troubleshooting

### Query not fetching?
- Check `enabled` option (defaults to `browser` only)
- Check if component is mounted

### Mutation not working?
- Make sure to pass data to `mutate()`
- Check network tab for API errors

### Stale data?
- Adjust `staleTime` in QueryClient config
- Manually call `refetch()`

## Examples

See these files for working examples:
- `src/lib/components/login-form.svelte`
- `src/lib/components/otp-form.svelte`
- `src/routes/password-reset/+page.svelte`
- `src/routes/settings/mfa/+page.svelte`

## More Info

Full documentation: [TANSTACK_QUERY_SETUP.md](./TANSTACK_QUERY_SETUP.md)