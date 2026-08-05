# Nexo CRM

CRM B2B para gestionar contactos, empresas, oportunidades y actividades comerciales desde una única interfaz.

## Funcionalidades

- Autenticación con Google mediante Supabase Auth.
- Dashboard con indicadores de pipeline, conversión, tareas y oportunidades recientes.
- Pipeline Kanban con creación, edición, eliminación y movimiento de oportunidades entre etapas.
- Gestión de contactos y empresas con búsqueda y formularios.
- Actividades comerciales: tareas, llamadas, reuniones y notas con estados y prioridades.
- Reportes de pipeline, embudo y resultados de ventas.
- Configuración para administradores: usuarios, pipelines y etapas.
- Interfaz responsive, tema claro/oscuro y diseño CRM moderno.

## Stack

- React 19 + TypeScript
- TanStack Start, Router y React Query
- Tailwind CSS + componentes Radix UI
- Supabase (Auth y PostgreSQL con RLS)
- Vite + Nitro

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Proyecto de Supabase configurado

## Instalación local

```bash
git clone https://github.com/Felipe7774/NEXUS.git
cd NEXUS
npm install
cp .env.example .env
npm run dev
```

En Windows, crea el archivo `.env` manualmente a partir de `.env.example`.

## Variables de entorno

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
VITE_SUPABASE_PROJECT_ID=<project-ref>

# Requeridas únicamente para operaciones del servidor.
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
SUPABASE_PROJECT_ID=<project-ref>
SUPABASE_SERVICE_ROLE_KEY=sb_secret_<key>
```

Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en variables `VITE_*` ni en el navegador.

## Base de datos

El proyecto está vinculado mediante Supabase CLI. Las migraciones viven en `supabase/migrations`.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
```

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Compilación de producción
npm run lint     # Análisis estático
npm run format   # Formatea el código
```

## Arquitectura

```text
src/
  components/              Componentes reutilizables y UI
  hooks/                   Hooks de autenticación y estado
  integrations/supabase/   Cliente, middleware y tipos de Supabase
  lib/                     Consultas, mutaciones y utilidades CRM
  routes/                  Rutas y pantallas de TanStack Router
supabase/
  migrations/              Esquema versionado de la base de datos
docs/                      Documentación del proyecto
```

La lógica de acceso a datos está centralizada en `src/lib/crm.ts`. Las pantallas consumen hooks de React Query y los componentes de formularios mantienen las operaciones de creación, edición y eliminación separadas de la capa visual.

La documentación académica de arquitectura está disponible en [docs/Arquitectura en software.docx](docs/Arquitectura%20en%20software.docx).

## Despliegue

La aplicación puede desplegarse con Vercel. Configura las variables `VITE_SUPABASE_*` y `SUPABASE_*` necesarias en el proyecto de Vercel y ejecuta:

```bash
vercel --prod
```

## Configurar Google OAuth

1. En Google Cloud crea un cliente OAuth de tipo **Web application**.
2. Añade como origen autorizado `https://nexus-green-xi.vercel.app` y, para desarrollo, `http://localhost:8080`.
3. Añade como URI de redirección autorizada `https://ddlhzzjodxmkmlpyurur.supabase.co/auth/v1/callback`.
4. En Supabase, abre **Authentication → Providers → Google**, activa el proveedor y pega el Client ID y Client Secret de Google.
5. En **Authentication → URL Configuration**, registra `https://nexus-green-xi.vercel.app/auth` como Redirect URL permitida.

## Seguridad

- Las políticas RLS de Supabase protegen los datos del CRM.
- Las claves locales se mantienen en `.env`, archivo que no se versiona.
- Las claves de servicio se usan solo desde código de servidor.
