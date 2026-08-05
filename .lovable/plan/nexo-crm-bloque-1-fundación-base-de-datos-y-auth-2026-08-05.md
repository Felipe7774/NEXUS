# Nexo CRM — Bloque 1: fundación, base de datos y auth

Alcance de este paso: esquema, seguridad por roles, autenticación y layout base. Sin módulos de negocio todavía.

## Nota sobre el stack

El proyecto ya está sobre TanStack Start (React 19 + TypeScript strict + Vite + Tailwind + shadcn/ui + TanStack Query + react-hook-form + zod). El enrutador es TanStack Router, no react-router-dom: no es intercambiable en esta plataforma, así que las rutas se implementan con TanStack Router (mismas URLs: /login, /dashboard, etc.). El backend será Lovable Cloud (Postgres + Auth + RLS + Storage), y la lógica de servidor se hace con server functions en vez de Edge Functions.

## 1. Backend y esquema

Activar Lovable Cloud y crear en una migración:

- `profiles` (id → usuarios, full_name, email, avatar_url, manager_id, is_active, timestamps)
- `user_roles` con enum `app_role` ('admin','gerente','vendedor') en tabla aparte (nunca el rol dentro de profiles: evita escalada de privilegios)
- `companies`, `contacts` con sus campos, checks de estado/etapa/fuente y `deleted_at` para borrado suave
- `pipelines`, `stages` (position, default_probability, type open/won/lost)
- `deals` (monto, moneda COP, probabilidad, fecha esperada, position kanban, status, lost_reason, closed_at, deleted_at)
- `activities` (tipo, asunto, prioridad, due_at, completed_at, asignado, relaciones a deal/contact/company)
- `deal_stage_history` para métricas de conversión
- `tags` + `taggables` (etiquetas polimórficas)
- GRANTs explícitos para cada tabla nueva

## 2. Triggers y funciones

- Alta de usuario → fila en `profiles` + rol 'vendedor' en `user_roles`
- `updated_at = now()` en todas las tablas
- En `deals`: al cambiar de etapa registra en `deal_stage_history`; si la etapa es 'won'/'lost' fija status, probabilidad y `closed_at`
- Funciones `has_role`, `is_admin`, `is_gerente`, `team_member_ids` en SQL, todas SECURITY DEFINER con `search_path` fijo

## 3. RLS

Activada en todas las tablas, usando solo las funciones SECURITY DEFINER (sin consultar `profiles`/`user_roles` en línea, para evitar recursión):

- vendedor: solo sus filas (`owner_id = auth.uid()`, o `assigned_to` en actividades)
- gerente: filas de su equipo vía `team_member_ids(auth.uid())`
- admin: acceso total; único que gestiona roles, pipelines y etapas
- filas con `deleted_at` no nulo ocultas salvo para admin

## 4. Seed

Pipeline "Ventas B2B" con etapas: Prospecto 10 → Contacto inicial 25 → Calificado 40 → Propuesta enviada 60 → Negociación 80 → Ganado 100 (won) → Perdido 0 (lost). Se insertan como parte de la migración.

## 5. Auth y layout

- `/auth` con pestañas Iniciar sesión / Registrarse (email + contraseña, validación zod, mensajes en español). `/login` y `/signup` redirigen ahí.
- Rutas protegidas bajo el layout autenticado: sin sesión → `/auth`, con skeleton mientras carga (sin parpadeo de login).
- Sidebar colapsable: Dashboard, Pipeline, Contactos, Empresas, Actividades, Reportes, Configuración (solo admin). Header con buscador global (placeholder por ahora), campana de notificaciones y menú de usuario con avatar y cerrar sesión.
- Página `/` pública: landing breve con CTA a iniciar sesión. Home autenticado en `/dashboard` (páginas de módulo como esqueletos vacíos en este bloque).
- Utilidades es-CO: formato de moneda COP ($1.250.000) y fechas dd/MM/yyyy con date-fns.

## 6. Diseño

Sistema de tokens en `src/styles.css`: denso y limpio tipo Linear/Attio, primario índigo, modo claro y oscuro con toggle. Sin gradientes llamativos ni emojis en la UI.

## Detalles técnicos

- Roles en `user_roles` + `has_role()`, no en `profiles`.
- Lecturas con TanStack Query; datos del usuario firmado vía server functions con `requireSupabaseAuth` donde aplique.
- Tipos generados del esquema, TypeScript strict, sin `any`.
- Los bloques 2 a 5 (contactos/empresas, kanban, actividades/dashboard, configuración) se implementan después, uno por uno.
