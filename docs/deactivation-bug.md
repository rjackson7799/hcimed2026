# Deactivation Status Bug — Troubleshooting Log

**Date:** 2026-02-25
**Status:** Resolved
**Affected page:** `/portal/admin/users`

---

## Symptom

When an admin deactivates a user, the success toast fires ("Ryan Jackson has been deactivated") but the status badge in the table remains "Active". The user is actually deactivated in the database — they cannot log in — but the UI does not reflect the change.

---

## What Was Tried First (Did Not Work)

The initial diagnosis was that React Query's cache was stale and not reflecting the Supabase update. The fix attempted was adding an **optimistic update** (`onMutate`) to `useDeactivateUser` in `src/portal/hooks/useUsers.ts`:

```ts
onMutate: async (userId: string) => {
  await queryClient.cancelQueries({ queryKey: ['users'] });
  const previous = queryClient.getQueryData<Profile[]>(['users']);
  queryClient.setQueryData<Profile[]>(['users'], (old) =>
    old?.map((u) => u.id === userId ? { ...u, is_active: false } : u) ?? []
  );
  return { previous };
},
```

This correctly flips the badge to "Inactive" in the cache — **but** the `onSuccess` handler then called `queryClient.invalidateQueries(['users'])`, which triggered an immediate refetch that wiped out the optimistic update. The bug persisted.

---

## Root Cause

### The RLS Policy

In `docs/supabase-schema.sql` (line 383), the `profiles_read` policy is:

```sql
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT
  USING (
    is_active = true        -- ← HARD FILTER
    AND (
      id = auth.uid()
      OR public.is_admin()
      OR id IN (...)
    )
  );
```

**`is_active = true` is baked into the SELECT policy.** This applies to every query made with the anon key client — including the admin's own session.

### Full Failure Chain

| Step | What Happens | Result |
|------|-------------|--------|
| 1 | Admin clicks deactivate | `onMutate` fires |
| 2 | Optimistic update: sets `is_active: false` in React Query cache | Badge briefly shows "Inactive" |
| 3 | `mutationFn` calls `/api/deactivate-user` (service role key) | Supabase DB: `is_active = false` ✅ |
| 4 | Toast: "has been deactivated" | User sees success message ✅ |
| 5 | `onSuccess` calls `queryClient.invalidateQueries(['users'])` | Triggers fresh SELECT |
| 6 | `useUsers` queries `profiles` table via anon key | RLS filters out `is_active = false` rows |
| 7 | Deactivated user is **excluded** from the SELECT result | React Query replaces cache |
| 8 | Badge reverts to "Active" (old cached entry) | Bug manifests ❌ |

### Why "Active" Instead of Row Disappearing

The timing is subtle. The optimistic update and the refetch happen in rapid succession. During the refetch, React Query briefly re-renders using the previous non-optimistic cache data (the original `is_active: true` state), then settles on the RLS-filtered refetch result which excludes the row. Depending on React's render batching, the "Active" state from the pre-optimistic cache can flash back before the final render.

---

## The Fix

**Remove `invalidateQueries` from `useDeactivateUser`'s `onSuccess`.**

Since the RLS policy means a refetch will never return inactive users to the admin, the optimistic cache update IS the correct source of truth. There is no value in refetching — it will always undo the optimistic update.

```ts
// BEFORE (broken):
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] });
},

// AFTER (fixed):
// No onSuccess — optimistic cache is the source of truth.
// The deactivated user row persists with is_active: false
// until the page is manually reloaded.
```

**File changed:** `src/portal/hooks/useUsers.ts` in `useDeactivateUser()`

The `useDeleteUser` hook retains its `invalidateQueries` since a deleted user genuinely won't exist in either the DB or any RLS result — the cache removal and the refetch agree.

---

## Behavior After Fix

| Action | UI Result |
|--------|-----------|
| Deactivate user | Badge immediately flips to "Inactive"; Trash2 (delete) icon appears; UserX icon disappears |
| Page refresh | Deactivated user **disappears from the list** (RLS excludes them — correct, they can't log in) |
| Delete inactive user | Row immediately disappears from table; confirmed gone on refresh |

---

## Future Improvement (Optional)

The `profiles_read` RLS policy could be updated to allow admins to see **all** profiles (including inactive ones) so the admin user list remains accurate after deactivation without needing a page reload:

```sql
-- Replace the existing profiles_read policy with:
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_admin()            -- admins see ALL profiles, active or not
    OR (
      is_active = true              -- non-admins only see active profiles
      AND id IN (
        SELECT pa2.user_id FROM public.project_assignments pa1
        JOIN public.project_assignments pa2 ON pa1.project_id = pa2.project_id
        WHERE pa1.user_id = auth.uid()
      )
    )
  );
```

This would allow `invalidateQueries` to work correctly and show deactivated users persistently in the admin list rather than requiring a reload.
