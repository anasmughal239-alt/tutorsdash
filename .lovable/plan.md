# TutorDash MVP Build Plan

A tutor management platform with no auth (MVP). Built on TanStack Start + Lovable Cloud (Supabase).

## Scope confirmation

You asked for "no auth" — to keep this simple, all data will be readable/writable by anyone with the link. A single implicit "tutor" owns everything (no tutor_id filtering). Student Portal uses a per-student `share_token` for shareable read-only links. Auth can be layered on in Phase 2.

## Tech choices

- **Backend**: Lovable Cloud (Postgres + Storage). Public anon RLS policies on all tables for MVP.
- **Routing**: TanStack Start file-based routes under `src/routes/`.
- **UI**: Tailwind v4 + shadcn/ui (already installed). Sidebar via shadcn `Sidebar`.
- **Charts**: `recharts` for progress trends.
- **Dates**: `date-fns` + shadcn Calendar/Popover for pickers.
- **Storage**: bucket `materials`, path `modules/{module_id}/{filename}`.

## Database schema (one migration)

Tables: `students`, `modules`, `student_modules`, `lessons`, `attendance`, `materials`, `grades`, `assignments`, `student_assignments`. Drop `tutors` / `tutor_id` for MVP simplicity. Add `share_token uuid unique default gen_random_uuid()` on `students` for portal.

All tables: `GRANT SELECT, INSERT, UPDATE, DELETE TO anon, authenticated` + RLS enabled with permissive policies (MVP, no auth). Storage bucket `materials` public.

## Routes

```
src/routes/
  __root.tsx                  (sidebar layout with <Outlet/>)
  index.tsx                   (redirects to /dashboard)
  dashboard.tsx
  students.tsx                (list + add/edit/delete modal)
  students.$id.tsx            (detail: attendance, grades, assignments)
  modules.tsx
  modules.$id.tsx             (students, materials, assignments in module)
  lessons.tsx                 (list + calendar + add/edit)
  attendance.tsx              (pick lesson, mark each student)
  materials.tsx               (upload + grouped by topic/module)
  grades.tsx                  (record + table view)
  assignments.tsx             (create + per-student status)
  progress-reports.tsx        (select student/module/period)
  student-portal.$token.tsx   (public, no sidebar)
```

## Components

- `AppSidebar` with nav items + icons
- Reusable: `StatCard`, `DataTable`, `ConfirmDialog`, `EmptyState`
- Form modals built with shadcn `Dialog` + `react-hook-form` + `zod`

## Design system

Blue primary (#2563EB), green/amber/red semantic tokens, white bg. Tokens added to `src/styles.css` (oklch). Clean professional layout with cards + shadows.

## Build order

1. Enable Lovable Cloud + migration + storage bucket
2. Design system tokens + sidebar shell + dashboard
3. Modules + Students CRUD (foundation)
4. Lessons + Attendance
5. Grades + Assignments
6. Materials (file upload)
7. Progress Reports (with recharts)
8. Student Portal (public token route)

## Notes / trade-offs

- **No auth means anyone with the URL can edit data.** Fine for an MVP demo; do not put real student data in until Phase 2 adds auth.
- PDF export of progress reports → use browser print stylesheet rather than a PDF lib (keeps Worker bundle small).
- Calendar view = simple month grid built in-app (no heavy calendar dep).

Approve and I'll start building.
