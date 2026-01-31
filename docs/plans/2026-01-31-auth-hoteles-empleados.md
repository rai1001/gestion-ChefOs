# Magic link + hoteles/empleados (MVP) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir invitación por magic link (email) y permitir que cada usuario cree hoteles y empleados, con gestión básica de turnos/vacaciones y vista calendario semanal.

**Architecture:** Supabase auth (magic link) + tablas hoteles/empleados/shifts; API routes Next.js para CRUD; UI simple: sección “Hoteles”, “Empleados”, “Calendario semanal”. E2E en modo stub y prod-ready.

**Tech Stack:** Next.js App Router, Supabase Auth + PostgREST, React client components, Playwright, Vitest, Tailwind.

---

### Task 1: DB y seeds
**Files:**
- Create: `supabase/migrations/20260131_auth_hotels.sql`
- Modify: `supabase/seed_purchases.sql` (añadir hotel y empleados demo)
- Tests: `tests/db/schema.test.ts`

**Steps:**
1. Crear tablas: hotels(id, name, org_id, created_by), employees(id, hotel_id, name, email, role, status, vacation_from, vacation_to), shifts(id, employee_id, date, shift, status). FKs y RLS org_id.
2. Seed hotel demo “Hotel Demo” y 2 empleados.
3. Actualizar schema test para nuevas tablas.
4. Run `pnpm test --filter schema` (o suite completa) y ajustar.

### Task 2: Magic link invitación
**Files:**
- Modify: `src/app/api/auth/magic/route.ts` (nuevo) o reutilizar auth helper.
- Modify: `src/app/login/page.tsx` (añadir envío email magic link).
- Tests: `tests/lib/auth/magic.test.ts`

**Steps:**
1. API POST /api/auth/magic: recibe email, llama supabase.auth.signInWithOtp (email).
2. En login page, formulario email -> fetch API, mostrar mensaje de enviado.
3. Vitest: mock supabase client, esperar llamada signInWithOtp con email.

### Task 3: CRUD hoteles (UI + API)
**Files:**
- Add: `src/app/(app)/hotels/page.tsx`
- Add: `src/app/api/hotels/route.ts`
- Modify: `src/lib/hotels/store.ts` (stub in-memory)
- Tests: `tests/e2e/hotels.spec.ts`, `tests/lib/hotels/store.test.ts`

**Steps:**
1. API GET/POST hoteles (prod supabase, E2E stub).
2. UI lista hoteles + form crear (name). Data-testid `hotel-row`.
3. E2E: crea hotel y lo ve en la lista (stub).

### Task 4: CRUD empleados + asignar hotel
**Files:**
- Add: `src/app/(app)/employees/page.tsx`
- Add: `src/app/api/employees/route.ts`
- Modify: `src/lib/employees/store.ts` (stub)
- Tests: `tests/e2e/employees.spec.ts`, `tests/lib/employees/store.test.ts`

**Steps:**
1. API GET/POST employees (fields: hotel_id, name, email, role).
2. UI: selector de hotel, tabla empleados, crear empleado.
3. E2E: crea empleado asociado al hotel demo.

### Task 5: Calendario semanal (turnos/vacaciones)
**Files:**
- Add: `src/app/(app)/shifts/page.tsx`
- Add: `src/app/api/shifts/route.ts`
- Modify: `src/lib/shifts/store.ts` (stub)
- Tests: `tests/e2e/shifts.spec.ts`, `tests/lib/shifts/store.test.ts`

**Steps:**
1. API GET/POST shifts (date, shift: morning/evening, status: assigned/vacation/off).
2. UI: vista semanal (7 días) lista por empleado (fila), celdas coloreadas por estado; form rápido para asignar turno o marcar vacaciones.
3. E2E: asigna turno mañana y marca vacaciones; verifica colores.

### Task 6: Integración navbar y rutas
**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Modify: `tests/e2e/smoke.spec.ts` (añadir rutas)

**Steps:**
1. Añadir links “Hoteles”, “Empleados”, “Turnos” en sidebar/nav.
2. Smoke e2e: cargar /hotels, /employees, /shifts.

### Task 7: Documentación y contratos
**Files:**
- Update: `docs/api-contracts.md` (nuevos endpoints)
- Update: `docs/plans/2026-01-31-auth-hoteles-empleados.md` (marcar done)

**Steps:**
1. Documentar endpoints y payloads.
2. Marcar plan completado.

### Task 8: Commit & push
**Steps:**
1. `git status`, add.
2. `git commit -m "feat(auth+hotels): magic link + hoteles/empleados/turnos"`
3. `git push`.

--- 

Ready to execute with @test-driven-development + @vercel-react-best-practices. 
