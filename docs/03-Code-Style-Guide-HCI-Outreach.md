# Code Style Guide
## HCI Medical Group — Patient Outreach Tracking System

**Version:** 1.0  
**Date:** February 24, 2026  
**For use with:** Cursor AI IDE  

---

## 1. Project Structure

```
hci-outreach-portal/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Main layout wrapper (sidebar + content)
│   │   │   ├── Sidebar.tsx        # Role-aware navigation sidebar
│   │   │   ├── TopBar.tsx         # User info, project selector, logout
│   │   │   └── MobileNav.tsx      # Bottom tab bar for mobile
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx      # Summary cards + charts
│   │   │   ├── ProjectManager.tsx # Create/edit projects
│   │   │   ├── CsvUploader.tsx    # CSV import with preview + validation
│   │   │   ├── UserManager.tsx    # Create/manage users
│   │   │   └── StaffActivity.tsx  # Staff performance table
│   │   ├── staff/
│   │   │   ├── PatientQueue.tsx   # Patient list with filters
│   │   │   ├── PatientCard.tsx    # Single patient row/card
│   │   │   ├── CallLogger.tsx     # Disposition + notes form
│   │   │   ├── CallHistory.tsx    # Previous attempts accordion
│   │   │   └── BrokerForward.tsx  # Forward confirmation modal
│   │   ├── broker/
│   │   │   ├── ForwardedList.tsx  # Broker's patient pipeline
│   │   │   ├── StatusUpdater.tsx  # Update transition status
│   │   │   └── MessageThread.tsx  # Comment thread on patient
│   │   └── shared/
│   │       ├── StatusBadge.tsx    # Color-coded status indicator
│   │       ├── PatientDetail.tsx  # Shared patient detail view
│   │       ├── ExportButton.tsx   # CSV export functionality
│   │       └── LoadingStates.tsx  # Skeleton loaders, spinners
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state + role checking
│   │   ├── useProject.ts         # Current project context
│   │   ├── usePatients.ts        # Patient queries + mutations
│   │   ├── useOutreach.ts        # Outreach log mutations
│   │   ├── useDashboard.ts       # Dashboard aggregate queries
│   │   └── useRealtime.ts        # Supabase realtime subscriptions
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client initialization
│   │   ├── csv.ts                # CSV parsing + validation
│   │   ├── email.ts              # Broker email formatting
│   │   └── export.ts             # Data export utilities
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProjects.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── StaffDashboard.tsx
│   │   └── BrokerDashboard.tsx
│   ├── types/
│   │   ├── database.ts           # Generated Supabase types
│   │   ├── enums.ts              # Disposition, status enums
│   │   └── index.ts              # Shared app types
│   ├── utils/
│   │   ├── formatters.ts         # Date, phone, name formatting
│   │   ├── constants.ts          # Status colors, labels, config
│   │   └── validators.ts         # Input validation helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                 # Tailwind imports + custom styles
├── supabase/
│   ├── migrations/               # SQL migration files
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── send-broker-email/
│       │   └── index.ts
│       └── import-patients-csv/
│           └── index.ts
├── .env.local                    # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 2. Technology Stack & Versions

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety (strict mode) |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Component library |
| @supabase/supabase-js | 2.x | Database client |
| @tanstack/react-query | 5.x | Server state management |
| react-router-dom | 6.x | Client-side routing |
| recharts | 2.x | Dashboard charts |
| papaparse | 5.x | CSV parsing |
| lucide-react | latest | Icons |
| date-fns | 3.x | Date formatting |
| zod | 3.x | Schema validation |

---

## 3. TypeScript Conventions

### 3.1 Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 3.2 Type Definitions
Always use Supabase-generated types. Regenerate after schema changes:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

### 3.3 Application Types

```typescript
// src/types/enums.ts
export const DISPOSITION = {
  NO_ANSWER: 'no_answer',
  VOICEMAIL: 'voicemail',
  NEEDS_MORE_INFO: 'needs_more_info',
  NOT_INTERESTED: 'not_interested',
  WILL_SWITCH: 'will_switch',
  WRONG_NUMBER: 'wrong_number',
  DISCONNECTED: 'disconnected',
} as const;

export type Disposition = typeof DISPOSITION[keyof typeof DISPOSITION];

export const OUTREACH_STATUS = {
  NOT_CALLED: 'not_called',
  NO_ANSWER: 'no_answer',
  NEEDS_MORE_INFO: 'needs_more_info',
  NOT_INTERESTED: 'not_interested',
  WILL_SWITCH: 'will_switch',
  FORWARDED_TO_BROKER: 'forwarded_to_broker',
  WRONG_NUMBER: 'wrong_number',
  COMPLETED: 'completed',
  UNABLE_TO_COMPLETE: 'unable_to_complete',
} as const;

export type OutreachStatus = typeof OUTREACH_STATUS[keyof typeof OUTREACH_STATUS];

export const USER_ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff',
  BROKER: 'broker',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
```

### 3.4 Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `PatientCard.tsx` |
| Hooks | camelCase with `use` prefix | `usePatients.ts` |
| Utilities | camelCase | `formatPhoneNumber()` |
| Constants | SCREAMING_SNAKE_CASE | `DISPOSITION.WILL_SWITCH` |
| Types/Interfaces | PascalCase | `PatientRecord` |
| Database columns | snake_case | `outreach_status` |
| CSS classes | Tailwind utilities only | `className="text-sm font-medium"` |
| File names | PascalCase for components, camelCase for utilities | `CallLogger.tsx`, `formatters.ts` |

---

## 4. Component Patterns

### 4.1 Component Structure
Every component follows this order:

```typescript
// 1. Imports (external, then internal, then types)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/hooks/usePatients';
import type { PatientRecord } from '@/types';

// 2. Types (component-specific, if not shared)
interface PatientCardProps {
  patient: PatientRecord;
  onCallLogged: (patientId: string) => void;
}

// 3. Component definition (always named export)
export function PatientCard({ patient, onCallLogged }: PatientCardProps) {
  // 3a. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Derived state
  const isCallable = patient.outreach_status !== 'completed';

  // 3c. Handlers
  function handleLogCall() {
    onCallLogged(patient.id);
  }

  // 3d. Render
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {/* ... */}
    </div>
  );
}
```

### 4.2 Do NOT Use
- `default export` — always use named exports for tree-shaking and refactoring
- `React.FC` — use explicit props typing instead
- `useEffect` for data fetching — use React Query
- Inline styles — use Tailwind exclusively
- `any` type — use `unknown` and narrow, or define proper types
- CSS modules or styled-components — Tailwind only

### 4.3 Component Size Rule
If a component exceeds ~150 lines, break it into sub-components. Each file should have one primary exported component.

---

## 5. State Management

### 5.1 Server State (React Query + Supabase)
All data fetching goes through React Query. Never use `useEffect` + `useState` for API calls.

```typescript
// src/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePatients(projectId: string) {
  return useQuery({
    queryKey: ['patients', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('project_id', projectId)
        .order('outreach_status', { ascending: true })  // uncalled first
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 30_000,  // 30 seconds
  });
}

export function useLogOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: OutreachLogInsert) => {
      const { data, error } = await supabase
        .from('outreach_logs')
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate patients list to reflect updated status
      queryClient.invalidateQueries({ queryKey: ['patients', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.project_id] });
    },
  });
}
```

### 5.2 Client State
Use `useState` for UI-only state (modals, filters, form inputs). Keep it minimal.

### 5.3 Realtime Subscriptions
Use a custom hook that subscribes to Supabase Realtime and invalidates React Query cache:

```typescript
// src/hooks/useRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useRealtimePatients(projectId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`patients-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patients',
        filter: `project_id=eq.${projectId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['patients', projectId] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', projectId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, queryClient]);
}
```

---

## 6. Styling Guide

### 6.1 Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // HCI brand colors
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',  // Primary blue
          600: '#1D4ED8',
          700: '#1E40AF',
        },
      },
    },
  },
};
```

### 6.2 Status Colors (Consistent Everywhere)

```typescript
// src/utils/constants.ts
export const STATUS_CONFIG: Record<OutreachStatus, { color: string; bg: string; label: string }> = {
  not_called:         { color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'Not Called' },
  no_answer:          { color: 'text-gray-700',   bg: 'bg-gray-100',   label: 'No Answer' },
  needs_more_info:    { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Needs More Info' },
  not_interested:     { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Not Interested' },
  will_switch:        { color: 'text-green-700',  bg: 'bg-green-100',  label: 'Will Switch' },
  forwarded_to_broker:{ color: 'text-purple-700', bg: 'bg-purple-100', label: 'Forwarded to Broker' },
  wrong_number:       { color: 'text-red-700',    bg: 'bg-red-100',    label: 'Wrong Number' },
  completed:          { color: 'text-emerald-700',bg: 'bg-emerald-100',label: 'Completed' },
  unable_to_complete: { color: 'text-red-700',    bg: 'bg-red-100',    label: 'Unable to Complete' },
};
```

### 6.3 Component Styling Patterns

```tsx
// Card pattern
<div className="rounded-lg border bg-white p-4 shadow-sm">

// Summary stat card
<div className="rounded-lg border bg-white p-6">
  <p className="text-sm font-medium text-gray-500">Total Patients</p>
  <p className="mt-1 text-3xl font-bold text-gray-900">247</p>
</div>

// Table
<table className="w-full text-sm">
  <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
  <tbody className="divide-y">

// Status badge
<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>

// Action button (primary)
<Button className="bg-brand-500 hover:bg-brand-600 text-white">

// Disposition button (large, color-coded, one-tap)
<button className="flex-1 rounded-lg border-2 p-4 text-center font-medium transition-colors hover:shadow-md">
```

### 6.4 Responsive Patterns
```tsx
// Sidebar: hidden on mobile, visible on desktop
<aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">

// Content area: full width mobile, offset on desktop
<main className="lg:pl-64">

// Grid: stack on mobile, multi-col on desktop
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

// Mobile bottom nav (staff/broker)
<nav className="fixed bottom-0 left-0 right-0 border-t bg-white lg:hidden">
```

---

## 7. Routing & Auth Guard

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/portal" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowedRoles={['admin']} />}>
            <Route path="/portal/admin" element={<AdminDashboard />} />
            <Route path="/portal/admin/projects" element={<AdminProjects />} />
            <Route path="/portal/admin/users" element={<AdminUsers />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={['staff']} />}>
            <Route path="/portal/staff" element={<StaffDashboard />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={['broker']} />}>
            <Route path="/portal/broker" element={<BrokerDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/portal" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Auth Guard Pattern
```typescript
// src/components/layout/AuthGuard.tsx
export function AuthGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/portal" replace />;

  return <Outlet />;
}

// src/components/layout/RoleGuard.tsx
export function RoleGuard({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { profile } = useAuth();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
}
```

---

## 8. Error Handling

### 8.1 API Errors
```typescript
// Always wrap Supabase calls and check for errors
const { data, error } = await supabase.from('patients').select('*');
if (error) throw error;  // Let React Query's error boundary handle it

// In components, use React Query's error state
const { data, error, isLoading } = usePatients(projectId);
if (error) return <ErrorMessage message="Failed to load patients" />;
```

### 8.2 Form Validation
Use Zod for all form validation:

```typescript
import { z } from 'zod';

export const callLogSchema = z.object({
  disposition: z.enum(['no_answer', 'voicemail', 'needs_more_info', 'not_interested', 'will_switch', 'wrong_number', 'disconnected']),
  notes: z.string().max(500).optional(),
});

export type CallLogInput = z.infer<typeof callLogSchema>;
```

### 8.3 Toast Notifications
Use sonner (via shadcn/ui) for success/error toasts:

```typescript
import { toast } from 'sonner';

// After successful call log
toast.success('Call logged successfully');

// After error
toast.error('Failed to log call. Please try again.');

// After broker forward
toast.success('Patient forwarded to broker. Email sent.');
```

---

## 9. CSV Import Handling

```typescript
// src/lib/csv.ts
import Papa from 'papaparse';
import { z } from 'zod';

const patientRowSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  date_of_birth: z.string().refine(isValidDate, 'Invalid date'),
  phone_primary: z.string().min(10, 'Phone required'),
  phone_secondary: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  current_insurance: z.string().optional(),
  member_id: z.string().optional(),
  notes: z.string().optional(),
});

export function parsePatientCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const valid: PatientRow[] = [];
        const errors: CsvError[] = [];

        results.data.forEach((row, index) => {
          const parsed = patientRowSchema.safeParse(row);
          if (parsed.success) {
            valid.push(parsed.data);
          } else {
            errors.push({ row: index + 2, issues: parsed.error.issues });
          }
        });

        resolve({ valid, errors, total: results.data.length });
      },
    });
  });
}
```

---

## 10. Testing Approach

### 10.1 Priority
1. **Integration tests** for critical workflows (call logging, broker forwarding)
2. **Component tests** for complex UI (CSV upload preview, dashboard charts)
3. **Unit tests** for utilities (CSV parsing, phone formatting, date validation)

### 10.2 Tools
- Vitest for unit/integration tests
- React Testing Library for component tests
- MSW (Mock Service Worker) for Supabase API mocking

### 10.3 Test File Location
Co-locate tests with source files:
```
src/hooks/usePatients.ts
src/hooks/usePatients.test.ts
src/lib/csv.ts
src/lib/csv.test.ts
```

---

## 11. Environment Variables

```bash
# .env.local (never commit)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_BROKER_EMAIL_DEFAULT=broker@regalipa.com

# For Edge Functions
RESEND_API_KEY=re_xxxxx
```

Access in code:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

---

## 12. Git Conventions

### Branch Naming
```
feature/csv-upload
feature/call-logger
feature/admin-dashboard
fix/rls-policy-broker
chore/update-deps
```

### Commit Messages
```
feat: add one-tap call logging with auto-timestamp
fix: broker can only see forwarded patients (RLS policy)
chore: regenerate Supabase types
docs: update PRD with broker workflow changes
```

### PR Checklist
- [ ] TypeScript strict mode passes
- [ ] No `any` types introduced
- [ ] RLS policies tested for all 3 roles
- [ ] Mobile responsive tested at 375px width
- [ ] Loading and error states handled
- [ ] Toast notifications for user actions

---

## 13. Performance Guidelines

- **Pagination:** Patient lists > 100 rows should use cursor-based pagination
- **Debounce:** Search input debounced at 300ms
- **Memoization:** Use `useMemo` for expensive computed values (dashboard aggregates from raw data)
- **Images:** No images in MVP; if added later, use next-gen formats + lazy loading
- **Bundle size:** Monitor with `vite-plugin-bundle-analyzer`; keep initial JS < 200KB gzipped

---

## 14. Cursor AI Instructions

When working in Cursor, use these principles:

1. **Always read the PRD first** for feature context before implementing
2. **Check the schema** for correct column names and types before writing queries
3. **Follow the component structure** in Section 4.1 exactly
4. **Use React Query** for all data fetching — never bare `useEffect` + `fetch`
5. **Generate Supabase types** after any migration and import from `@/types/database`
6. **Test all 3 roles** when touching RLS policies or auth guards
7. **Status colors** come from `STATUS_CONFIG` — never hardcode colors for statuses
8. **Named exports only** — no `export default`
9. **Tailwind only** — no inline styles, no CSS modules
10. **PHI awareness** — never log patient data to console in production; no patient data in URLs
