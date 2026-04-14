# Auth Stability & Logging — Design Spec
**Date:** 2026-03-30
**Status:** Approved
**Scope:** `apps/portal` only

---

## Context

Users intermittently experience complete browser tab freezes when:
1. Logging in to `portal.hcimed.com/login`
2. Submitting patient forms (Add / Edit Patient shows "Adding..." spinner stuck)
3. After either freeze, the logout button stops responding

A hard refresh clears the issue but forces re-login. Multiple staff members on different machines reported the same symptoms, ruling out a local cache issue.

**Root cause:** Five discrete bugs in `AuthContext.tsx`, `LoginForm.tsx`, and `usePatients.ts` interact to produce three observable failure modes — infinite spinners, tab freezes, and broken logout. Adding structured audit logging as part of this fix gives admins visibility into when and why these events occur.

---

## Root Causes (All Confirmed by Code Review)

| # | Bug | File | Effect |
|---|-----|------|--------|
| 1 | `window.location.href` used for all auth navigation | `AuthContext.tsx` L84, L178, L199, L224, L253 | Full-page reload triggered mid-React render; multiple competing reloads freeze the tab |
| 2 | `signOut()` navigates AND fires `SIGNED_OUT` event which also navigates | `AuthContext.tsx` L253 + L224 | Double navigation — second call stacks behind first, tab freezes |
| 3 | `isAuthenticated = !!session && !!profile` | `AuthContext.tsx` L270 | Profile fetch failure = valid session treated as unauthenticated → `AuthGuard` bounces user to `/login` → reload loop |
| 4 | `LoginForm.onSubmit` has no `try/catch` | `LoginForm.tsx` L42–55 | If `signIn` throws (network drop, malformed response), `isSubmitting` stays `true` forever — no escape without hard refresh |
| 5 | `showTimeoutWarning` in effect dependency array causes `resetTimers()` to run immediately when warning fires | `AuthContext.tsx` L92–112 | Timer resets itself on every tick; session timeout mechanism is non-functional |
| 6 | `useUpdatePatient` / `useDeletePatient` have no AbortController timeout | `usePatients.ts` L120–160 | Supabase requests hang indefinitely when network drops or token expires mid-request; triggers auth refresh cascade |

---

## Approach: Surgical Fixes + Structured Logging

Fix only the six confirmed bugs. Add a shared logging utility and expand the existing audit-log endpoint to capture auth health events. No new external dependencies. No schema changes.

---

## Files Changed

### Modified (5)

#### 1. `apps/portal/src/context/AuthContext.tsx`

**Fix 1 — Replace `window.location.href` with `useNavigate()`**
`AuthProvider` is mounted inside `BrowserRouter` (via the route layout `<AuthProvider><AuthGuard /></AuthProvider>` and `LoginPage`'s own `<AuthProvider>` wrapper), so `useNavigate()` is available. Replace all 5 occurrences of `window.location.href = loginPath` with `navigate(loginPath, { replace: true })`.

**Fix 2 — Eliminate double navigation on signOut**
`signOut()` currently navigates AND the `SIGNED_OUT` handler navigates. Remove navigation from `signOut()` — call `supabase.auth.signOut()` only and let the `SIGNED_OUT` handler do the single navigate. Same fix for the inactivity logout timer.

**Fix 3 — `isAuthenticated` must not require profile**
Change:
```typescript
// Before
isAuthenticated: !!session && !!profile,

// After
isAuthenticated: !!session && !!user,
```
Profile is supplementary data. A missing profile must not block an authenticated user.

**Fix 4 — `showTimeoutWarning` timer loop**
Extract `showTimeoutWarning` from the effect dependency array by replacing the boolean state reference inside the handler with a ref (`showTimeoutWarningRef`). A separate one-line effect keeps the ref in sync with the state. This stops the effect from re-running `resetTimers()` every time the warning fires.

```typescript
const showTimeoutWarningRef = useRef(false);
useEffect(() => { showTimeoutWarningRef.current = showTimeoutWarning; }, [showTimeoutWarning]);

// Activity effect deps: [session, resetTimers] — no showTimeoutWarning
useEffect(() => {
  if (!session) return;
  const handleActivity = () => {
    if (!showTimeoutWarningRef.current) resetTimers();
  };
  // ... add/remove listeners
  resetTimers();
  return () => { /* cleanup */ };
}, [session, resetTimers]);
```

**Logging additions in AuthContext**
Replace the inline `logAuditEvent` function with calls to the new shared `logEvent()` utility. Add calls for:
- `AUTH_TOKEN_REFRESH_FAILED` — when `onAuthStateChange` receives a null session outside of deliberate sign-out
- `SESSION_FORCED_LOGOUT` — just before the forced-logout navigate
- `SESSION_TIMEOUT` — when the 30-min inactivity timer fires
- `PROFILE_FETCH_FAILED` — when `fetchProfile` returns null after all retries

---

#### 2. `apps/portal/src/components/auth/LoginForm.tsx`

**Fix — Add `try/catch/finally` to `onSubmit`**

```typescript
const onSubmit = async (data: LoginFormData) => {
  setIsSubmitting(true);
  setError(null);
  try {
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(from, { replace: true });
  } catch {
    setError('An unexpected error occurred. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

The `finally` guarantees `isSubmitting` resets regardless of how `signIn` exits. In the success path, `navigate` fires synchronously and the component unmounts before React processes the `setIsSubmitting(false)` call — no visible flash.

---

#### 3. `apps/portal/src/hooks/usePatients.ts`

**Fix — Add AbortController + timeout to `useUpdatePatient` and `useDeletePatient`**

Both mutations currently have no timeout — a hung network call means `isPending` stays `true` forever. Apply the same pattern already used in `useAddPatient`:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15_000);
try {
  const { error } = await supabase
    .from('patients')
    .update({...})
    .eq('id', patientId)
    .abortSignal(controller.signal);
  if (error) throw error;
} catch (err) {
  if (controller.signal.aborted) {
    logEvent({ action: 'REQUEST_TIMEOUT', context: { table: 'patients', operation: 'update', patientId } });
    throw new Error('Request timed out — please check your connection and try again.');
  }
  throw err;
} finally {
  clearTimeout(timeout);
}
```

---

#### 4. `apps/portal/api/audit-log.ts`

**Extended action allowlist**
```typescript
const ALLOWED_ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'AUTH_TOKEN_REFRESH_FAILED',
  'SESSION_FORCED_LOGOUT',
  'SESSION_TIMEOUT',
  'PROFILE_FETCH_FAILED',
  'REQUEST_TIMEOUT',
] as const;
```

**`email` becomes optional for system events**
Only `LOGIN_SUCCESS` and `LOGIN_FAILED` require email. System events (refresh failures, timeouts) fire without user input.

**`context` field added to request body**
Stored in `new_values` alongside email. Carries structured data: error codes, table names, retry counts, operation types.

---

#### 5. `apps/portal/src/components/admin/AuditLogViewer.tsx`

**Color-coded severity badges on the `action` column**

| Action | Badge |
|--------|-------|
| `LOGIN_SUCCESS` | green |
| `LOGIN_FAILED` | red |
| `AUTH_TOKEN_REFRESH_FAILED` | orange |
| `SESSION_FORCED_LOGOUT` | orange |
| `REQUEST_TIMEOUT` | orange |
| `SESSION_TIMEOUT` | yellow |
| `PROFILE_FETCH_FAILED` | yellow |
| Everything else | default (muted) |

---

### New (2)

#### 6. `apps/portal/src/lib/errors.ts`

Supabase error classifier. Maps raw Supabase/network errors to:
- `userMessage` — shown in toasts and form alerts
- `code` — normalized string for logging
- Flags: `isRateLimit`, `isNetworkError`, `isAuthError`, `isTimeout`

Handles: Supabase auth error codes (`over_request_rate_limit`, `invalid_grant`, `token_expired`), PostgreSQL RLS codes (`42501`, `PGRST301`), `AbortError`, `TypeError` (network fetch failure), and unknown fallback.

Used by `usePatients` mutation error handlers and `LoginForm` catch block.

---

#### 7. `apps/portal/src/lib/logEvent.ts`

Shared fire-and-forget audit logger. Extracts and generalizes the `logAuditEvent` pattern from `AuthContext`. Always non-blocking — errors are swallowed, 8s AbortController timeout prevents leaking.

```typescript
type AuditAction =
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED'
  | 'AUTH_TOKEN_REFRESH_FAILED' | 'SESSION_FORCED_LOGOUT'
  | 'SESSION_TIMEOUT' | 'PROFILE_FETCH_FAILED' | 'REQUEST_TIMEOUT';

export function logEvent(options: {
  action: AuditAction;
  email?: string;
  accessToken?: string;
  context?: Record<string, unknown>;
}): void
```

---

## Data Flow — Auth Navigation (After Fix)

```
supabase.auth.signOut()
  └─► SIGNED_OUT event fires
        └─► onAuthStateChange handler
              ├─ clears session/user/profile state
              ├─ logEvent({ action: 'SESSION_FORCED_LOGOUT' })  [if applicable]
              └─ navigate(loginPath, { replace: true })         [single navigate, no reload]

Inactivity timer fires (30 min)
  └─► logEvent({ action: 'SESSION_TIMEOUT' })
  └─► supabase.auth.signOut()
        └─► (same SIGNED_OUT path above)
```

---

## Verification

1. **Login freeze**: Log in, immediately open DevTools Network tab, attempt login. Confirm no full-page reload occurs on success or failure. Confirm spinner resets if an unexpected error is thrown (can simulate by temporarily breaking the Supabase URL in `.env.local`).

2. **Patient form freeze**: Open Add Patient dialog, submit a patient. Kill network mid-request (DevTools → Offline). Confirm: spinner stops within 15s, error toast appears, button re-enables, logout still works.

3. **Logout after error**: After any failed mutation, confirm the logout button navigates correctly without a hard refresh.

4. **Audit log entries**: After triggering each event (failed login, network kill mid-update, wait for session timeout), open Admin → Audit Log and confirm the new event types appear with correct context data and colored badges.

5. **Session timeout warning**: Confirm the timeout warning modal appears and stays visible. Confirm clicking "Extend Session" actually resets the 30-minute timer.

6. **`isAuthenticated` stability**: Open DevTools Application → Local Storage, manually corrupt the profile row in Supabase (or temporarily add a bad RLS policy). Confirm login still lands on the dashboard rather than redirect-looping.
