# Arquitectura C4 de Nexo CRM

> Versión local histórica incorporada a Git el 22/10/2026. Estos diagramas
> preceden la separación interna de persistencia del módulo 6. El estado y los
> límites actuales se documentan en [dossier 07](../dossier/07-distribucion-y-resiliencia.md).

## Nivel 1 — Contexto

```mermaid
C4Context
    title Nivel 1 — Contexto de Nexo CRM

    Person(vendedor, "Vendedor", "Gestiona contactos, empresas, oportunidades y actividades.")
    Person(gerente, "Gerente comercial", "Consulta el pipeline, indicadores y reportes.")
    Person(admin, "Administrador", "Gestiona usuarios, roles, pipelines y etapas.")

    System(nexo, "Nexo CRM", "CRM B2B para gestionar contactos, empresas, oportunidades y actividades comerciales.")

    System_Ext(supabase, "Supabase", "Proporciona autenticación, PostgreSQL y seguridad RLS.")
    System_Ext(hosting, "Vercel / Cloudflare", "Aloja y ejecuta la aplicación web.")

    Rel(vendedor, nexo, "Gestiona información comercial", "HTTPS")
    Rel(gerente, nexo, "Consulta indicadores y reportes", "HTTPS")
    Rel(admin, nexo, "Administra la configuración", "HTTPS")
    Rel(nexo, supabase, "Autentica usuarios y gestiona datos", "Supabase API / HTTPS")
    Rel(hosting, nexo, "Aloja y ejecuta", "Nitro")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Nivel 2 — Contenedores

```mermaid
C4Container
    title Nivel 2 — Contenedores de Nexo CRM

    Person(vendedor, "Vendedor", "Gestiona contactos, empresas, oportunidades y actividades.")
    Person(gerente, "Gerente comercial", "Consulta el pipeline, indicadores y reportes.")
    Person(admin, "Administrador", "Gestiona usuarios, roles y configuración.")

    System_Boundary(nexo, "Nexo CRM") {
        Container(webapp, "Aplicación web", "React 19, TypeScript, TanStack Start, Vite y Nitro", "Presenta la interfaz, procesa solicitudes y ejecuta la lógica del CRM.")
    }

    System_Boundary(supabase, "Proyecto Supabase") {
        Container(auth, "Autenticación", "Supabase Auth", "Gestiona usuarios, credenciales y sesiones.")
        ContainerDb(database, "Base de datos CRM", "PostgreSQL", "Almacena la información comercial.")
        Container(security, "Control de acceso", "PostgreSQL RLS", "Aplica políticas de acceso según la identidad y el rol.")
    }

    System_Ext(hosting, "Vercel / Cloudflare", "Plataforma de despliegue.")

    Rel(vendedor, webapp, "Gestiona información comercial", "HTTPS")
    Rel(gerente, webapp, "Consulta indicadores y reportes", "HTTPS")
    Rel(admin, webapp, "Administra la configuración", "HTTPS")
    Rel(webapp, auth, "Autentica usuarios", "HTTPS")
    Rel(webapp, database, "Consulta y modifica datos", "Supabase API / HTTPS")
    Rel(auth, security, "Proporciona identidad y roles", "JWT")
    Rel(security, database, "Restringe las operaciones", "RLS")
    Rel(hosting, webapp, "Aloja y ejecuta", "Nitro")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Nivel 3 — Componentes de la aplicación web

```mermaid
C4Component
    title Nivel 3 — Componentes de la aplicación web Nexo CRM

    Person(vendedor, "Vendedor", "Gestiona información comercial.")
    Person(gerente, "Gerente comercial", "Consulta indicadores y reportes.")
    Person(admin, "Administrador", "Gestiona usuarios y configuración.")

    Container_Boundary(webapp, "Aplicación web Nexo CRM") {
        Component(auth_ui, "Autenticación y autorización", "React, TanStack Router", "Gestiona registro, inicio de sesión, sesión activa y roles.")
        Component(crm_ui, "Empresas y contactos", "React", "Muestra y modifica empresas y contactos.")
        Component(pipeline_ui, "Pipeline de oportunidades", "React", "Muestra y mueve oportunidades entre etapas.")
        Component(activity_ui, "Actividades comerciales", "React", "Registra tareas, llamadas, reuniones, correos y notas.")
        Component(analytics_ui, "Dashboard y reportes", "React, Recharts", "Presenta indicadores y resultados comerciales.")
        Component(settings_ui, "Configuración administrativa", "React", "Muestra usuarios, roles, pipelines y etapas.")
        Component(data_access, "Acceso a datos CRM", "React Query, Supabase JS", "Ejecuta consultas y mutaciones sobre los datos del CRM.")
        Component(server, "Procesamiento de servidor", "TanStack Start, Nitro", "Procesa SSR, middleware, CSRF y respuestas de error.")
    }

    Container_Ext(auth, "Supabase Auth", "Supabase", "Gestiona identidades y sesiones.")
    ContainerDb_Ext(database, "Base de datos CRM", "PostgreSQL", "Almacena la información comercial.")

    Rel(vendedor, crm_ui, "Gestiona empresas y contactos", "HTTPS")
    Rel(vendedor, pipeline_ui, "Gestiona oportunidades", "HTTPS")
    Rel(vendedor, activity_ui, "Gestiona actividades", "HTTPS")
    Rel(gerente, analytics_ui, "Consulta indicadores", "HTTPS")
    Rel(admin, settings_ui, "Administra configuración", "HTTPS")

    Rel(auth_ui, auth, "Inicia y valida sesiones", "Supabase API")
    Rel(crm_ui, data_access, "Solicita operaciones CRUD")
    Rel(pipeline_ui, data_access, "Solicita operaciones de oportunidades")
    Rel(activity_ui, data_access, "Solicita operaciones de actividades")
    Rel(analytics_ui, data_access, "Solicita datos de indicadores")
    Rel(settings_ui, data_access, "Solicita usuarios y configuración")
    Rel(server, auth_ui, "Adjunta y valida la sesión")
    Rel(data_access, database, "Consulta y modifica datos", "Supabase API / HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Archivos de los componentes de la aplicación web

- **Autenticación y autorización:** `src/routes/login.tsx`, `src/routes/signup.tsx`, `src/hooks/use-auth.ts` y `src/routes/_authenticated/route.tsx`.
- **Empresas y contactos:** `src/routes/_authenticated/companies.tsx`, `src/routes/_authenticated/contacts.tsx` y `src/components/crm/`.
- **Pipeline:** `src/routes/_authenticated/pipeline.tsx` y `src/components/crm/deal-dialog.tsx`.
- **Actividades:** `src/routes/_authenticated/activities.tsx` y `src/components/crm/activity-dialog.tsx`.
- **Dashboard y reportes:** `src/routes/_authenticated/dashboard.tsx` y `src/routes/_authenticated/reports.tsx`.
- **Configuración:** `src/routes/_authenticated/settings.tsx`.
- **Acceso a datos:** `src/lib/crm.ts` y `src/integrations/supabase/client.ts`.
- **Procesamiento de servidor:** `src/server.ts`, `src/start.ts` y `src/integrations/supabase/auth-middleware.ts`.

## Nivel 3 — Componentes de Supabase

```mermaid
C4Component
    title Nivel 3 — Componentes del proyecto Supabase

    Container_Ext(webapp, "Aplicación web Nexo CRM", "React y TanStack Start", "Utiliza los servicios de Supabase.")

    Container_Boundary(supabase, "Proyecto Supabase") {
        Component(auth, "Autenticación", "Supabase Auth", "Registra usuarios, valida credenciales y mantiene sesiones.")
        Component(profiles, "Usuarios y roles", "PostgreSQL", "Almacena perfiles y roles de los usuarios.")
        Component(customers, "Empresas y contactos", "PostgreSQL", "Almacena empresas, contactos y stakeholders.")
        Component(sales, "Gestión de ventas", "PostgreSQL", "Almacena pipelines, etapas, oportunidades e historial.")
        Component(activities, "Actividades", "PostgreSQL", "Almacena tareas, llamadas, reuniones, correos y notas.")
        Component(security, "Políticas RLS", "PostgreSQL RLS", "Controla las operaciones permitidas sobre cada tabla.")
    }

    Rel(webapp, auth, "Autentica usuarios", "HTTPS")
    Rel(webapp, profiles, "Consulta perfiles y roles", "Supabase API")
    Rel(webapp, customers, "Gestiona empresas y contactos", "Supabase API")
    Rel(webapp, sales, "Gestiona oportunidades y pipelines", "Supabase API")
    Rel(webapp, activities, "Gestiona actividades", "Supabase API")

    Rel(auth, security, "Proporciona la identidad", "JWT")
    Rel(security, profiles, "Restringe el acceso", "RLS")
    Rel(security, customers, "Restringe el acceso", "RLS")
    Rel(security, sales, "Restringe el acceso", "RLS")
    Rel(security, activities, "Restringe el acceso", "RLS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Archivos de los componentes de Supabase

- **Autenticación:** `supabase/config.toml`.
- **Usuarios, roles y datos del CRM:** `supabase/migrations/20260805035001_05269e6f-a1a0-41ee-9053-ba7d49685ade.sql`.
- **Stakeholders y documentos:** `supabase/migrations/20260822010000_add_stakeholders_and_client_health.sql`.
- **Políticas RLS:** instrucciones `CREATE POLICY` de los archivos en `supabase/migrations/`.
