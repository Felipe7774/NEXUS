# Nexo CRM: Your Business Connector

# Prompt para Lovable — CRM B2B

> **Cómo usarlo:** pega el BLOQUE 1 como primer mensaje en Lovable. Espera a que genere y conecte Supabase. Luego pega los bloques siguientes de uno en uno. No pegues todo junto: Lovable pierde precisión con prompts gigantes.

---

## BLOQUE 1 — Fundación, base de datos y auth

```
Construye un CRM de ventas B2B llamado "Nexo CRM".

STACK (obligatorio):
- Frontend: React + TypeScript (strict mode) + Vite + Tailwind CSS + shadcn/ui
- Estado servidor: TanStack Query (React Query) para todo fetch/mutación
- Formularios: react-hook-form + zod para validación
- Rutas: react-router-dom
- Backend: Supabase (Postgres + Auth + RLS + Storage + Edge Functions en TypeScript)
- Sin any implícitos. Genera tipos desde el esquema de Supabase y úsalos en todo el frontend.

En este primer paso SOLO crea: el esquema de base de datos, las políticas RLS,
la autenticación y el layout base. No construyas todavía los módulos de negocio.

=== ESQUEMA DE BASE DE DATOS ===

profiles
- id uuid PK (referencia a auth.users)
- full_name text not null
- email text not null unique
- avatar_url text
- role text not null check in ('admin','gerente','vendedor') default 'vendedor'
- manager_id uuid null → profiles(id)   -- a qué gerente reporta este vendedor
- is_active boolean default true
- created_at, updated_at timestamptz

companies (empresas / cuentas)
- id uuid PK
- name text not null
- industry text
- website text
- phone text
- address text, city text, country text
- employee_count int
- annual_revenue numeric
- status text check in ('prospecto','activo','inactivo','churn') default 'prospecto'
- owner_id uuid → profiles(id) not null
- notes text
- created_at, updated_at, deleted_at (soft delete)

contacts
- id uuid PK
- company_id uuid → companies(id) on delete set null
- first_name text not null, last_name text not null
- email text, phone text, mobile text
- job_title text
- is_primary boolean default false   -- contacto principal de la empresa
- lifecycle_stage text check in ('lead','contactado','calificado','oportunidad','cliente','perdido') default 'lead'
- source text check in ('web','referido','evento','llamada_fria','redes','otro')
- owner_id uuid → profiles(id) not null
- notes text
- created_at, updated_at, deleted_at

pipelines
- id uuid PK, name text not null, is_default boolean default false

stages (etapas del pipeline, ordenables)
- id uuid PK
- pipeline_id uuid → pipelines(id) on delete cascade
- name text not null
- position int not null
- default_probability int check 0..100
- type text check in ('open','won','lost') default 'open'

deals (oportunidades)
- id uuid PK
- title text not null
- company_id uuid → companies(id)
- contact_id uuid → contacts(id)
- pipeline_id uuid → pipelines(id) not null
- stage_id uuid → stages(id) not null
- amount numeric(14,2) default 0
- currency text default 'COP'
- probability int check 0..100
- expected_close_date date
- position int not null default 0   -- orden dentro de la columna kanban
- status text check in ('open','won','lost') default 'open'
- lost_reason text
- closed_at timestamptz
- owner_id uuid → profiles(id) not null
- created_at, updated_at, deleted_at

activities (tareas y actividades)
- id uuid PK
- type text check in ('llamada','reunion','email','tarea','nota') not null
- subject text not null
- description text
- due_at timestamptz
- completed_at timestamptz
- priority text check in ('baja','media','alta') default 'media'
- assigned_to uuid → profiles(id) not null
- created_by uuid → profiles(id) not null
- deal_id uuid → deals(id) on delete cascade
- contact_id uuid → contacts(id) on delete cascade
- company_id uuid → companies(id) on delete cascade
- created_at, updated_at

deal_stage_history (auditoría para métricas de conversión)
- id uuid PK, deal_id uuid → deals(id) on delete cascade
- from_stage_id uuid null, to_stage_id uuid not null
- changed_by uuid → profiles(id)
- changed_at timestamptz default now()

tags + taggables (etiquetas polimórficas para contacts/companies/deals)

=== TRIGGERS Y FUNCIONES ===
1. Trigger on auth.users insert → crea fila en profiles con role 'vendedor'.
2. Trigger updated_at = now() en todas las tablas.
3. Trigger en deals: si cambia stage_id, inserta fila en deal_stage_history.
   Si la nueva etapa es type 'won' o 'lost', setea status y closed_at.
4. Función SQL is_admin(), is_gerente(), y team_member_ids(uid uuid)
   que devuelve el uid propio + los uid de quienes tienen manager_id = uid.
   Márcalas SECURITY DEFINER y usa search_path fijo para evitar recursión en RLS.

=== RLS (activar en TODAS las tablas) ===
- vendedor: SELECT/UPDATE/DELETE solo donde owner_id = auth.uid()
  (o assigned_to = auth.uid() en activities). INSERT solo con owner_id = auth.uid().
- gerente: acceso a filas cuyo owner_id esté en team_member_ids(auth.uid()).
- admin: acceso total, y es el único que puede modificar profiles.role,
  pipelines y stages.
- Nadie ve filas con deleted_at not null salvo admin.
IMPORTANTE: no consultes la tabla profiles directamente dentro de las políticas
sin SECURITY DEFINER, para evitar recursión infinita en RLS.

=== SEED ===
Crea un pipeline por defecto "Ventas B2B" con las etapas:
Prospecto (10%) → Contacto inicial (25%) → Calificado (40%) → Propuesta enviada (60%)
→ Negociación (80%) → Ganado (100%, type won) → Perdido (0%, type lost).

=== AUTH Y LAYOUT ===
- Páginas /login y /signup con email+password (shadcn Card, validación zod,
  mensajes de error en español).
- Ruta protegida: si no hay sesión → redirige a /login. Muestra skeleton
  mientras carga la sesión, nunca un flash de la pantalla de login.
- Layout con sidebar colapsable: Dashboard, Pipeline, Contactos, Empresas,
  Actividades, Reportes, Configuración (solo admin). Header con buscador global,
  campana de notificaciones y menú de usuario con avatar y logout.
- Español (es-CO), moneda COP con formato $1.250.000, fechas dd/MM/yyyy con date-fns.
- Diseño: limpio y denso tipo Linear/Attio. Modo claro y oscuro.
  Color primario índigo. Nada de gradientes exagerados ni emojis en la UI.
```

---

## BLOQUE 2 — Contactos y empresas

```
Ahora construye los módulos de Contactos y Empresas.

/contacts — tabla con TanStack Table:
- Columnas: nombre completo (con avatar de iniciales), empresa, cargo, email,
  teléfono, etapa del ciclo, propietario, última actividad.
- Búsqueda con debounce sobre nombre/email/teléfono (usa ilike en Supabase).
- Filtros combinables: etapa, propietario, fuente, empresa, etiquetas.
- Ordenamiento por columna y paginación del lado del servidor (25/50/100).
- Selección múltiple con acciones masivas: cambiar propietario, cambiar etapa,
  agregar etiqueta, eliminar (soft delete con confirmación).
- Botón "Nuevo contacto" abre un Sheet lateral, no una página aparte.
- Importar CSV: subir archivo, mapear columnas a campos, previsualizar 5 filas,
  reportar errores por fila, importar en lote. Exportar a CSV lo filtrado.

/contacts/:id — vista de detalle en dos columnas:
- Izquierda: datos del contacto, editables inline (click en el campo → input).
- Derecha: timeline cronológico unificado de actividades y cambios,
  con tabs "Todo / Notas / Tareas / Oportunidades".
- Caja rápida arriba del timeline para agregar nota o agendar tarea sin salir.

/companies — misma estructura. En el detalle de empresa muestra además:
contactos asociados, oportunidades abiertas con su valor total, y un badge
de estado (prospecto/activo/inactivo/churn) editable.

Reglas transversales:
- Toda mutación usa optimistic update de React Query + toast de confirmación,
  y revierte si falla.
- Estados vacíos con ilustración simple, texto explicativo y CTA.
- Skeletons durante la carga, nunca spinners a pantalla completa.
- Todo formulario valida con zod y muestra errores en español bajo cada campo.
```

---

## BLOQUE 3 — Pipeline Kanban

```
Construye /pipeline, el tablero Kanban de oportunidades.

- Usa @dnd-kit/core para drag & drop (no react-beautiful-dnd).
- Una columna por etapa, en orden por position. Encabezado de columna con
  nombre, cantidad de deals y suma total del valor de la columna.
- Card de oportunidad: título, nombre de empresa, monto formateado en COP,
  avatar del propietario, fecha esperada de cierre (en rojo si está vencida),
  y un punto de color según antigüedad sin actividad (verde <7d, amarillo <14d,
  rojo >14d).
- Arrastrar entre columnas actualiza stage_id y probability; arrastrar dentro
  de la columna reordena position. Optimistic update: la card se mueve al
  instante y revierte con toast de error si la mutación falla.
- Al soltar en una etapa type 'won' → modal de confirmación de cierre.
  En type 'lost' → modal que exige seleccionar lost_reason
  (precio, competencia, sin presupuesto, sin respuesta, mal timing, otro).
- Selector de pipeline arriba si hay más de uno.
- Filtros en la barra superior: propietario, rango de fechas de cierre,
  rango de monto, etiquetas. Toggle "Solo mis oportunidades".
- Botón "Nueva oportunidad": modal con título, empresa (combobox con búsqueda
  y opción "crear nueva"), contacto, monto, etapa, fecha esperada.
- Click en card → panel lateral de detalle con: datos editables inline,
  barra de progreso de etapas clickeable, timeline de actividades,
  y sección de tareas pendientes asociadas.
- Scroll horizontal suave con las columnas de encabezado fijas.
- Vista alternativa en tabla (toggle Kanban/Lista) con las mismas columnas y filtros.
```

---

## BLOQUE 4 — Actividades y dashboard

```
=== /activities ===
- Tres vistas conmutables: Lista, Calendario (mensual/semanal) y Kanban
  por estado (vencidas / hoy / esta semana / después).
- Cada item muestra ícono según tipo, asunto, entidad relacionada como link,
  responsable, fecha límite y checkbox para completar.
- Completar una tarea la tacha con animación y la mueve a la sección de completadas.
- Filtros: tipo, responsable, prioridad, rango de fechas, completadas sí/no.
- El vendedor ve por defecto solo sus tareas; el gerente puede alternar
  entre "Mis tareas" y "Mi equipo".

=== /dashboard ===
Cuatro tarjetas de KPI arriba, cada una con el valor, la variación % vs. el
período anterior y una flecha de tendencia:
1. Valor total del pipeline abierto
2. Oportunidades ganadas en el período (cantidad y monto)
3. Tasa de conversión (ganadas / total cerradas)
4. Ciclo de venta promedio en días

Gráficas con Recharts:
- Embudo de conversión por etapa (cuántos deals entraron a cada etapa
  según deal_stage_history y el % que avanzó a la siguiente).
- Barras: monto ganado por mes, últimos 12 meses.
- Dona: distribución de deals por fuente del contacto.
- Ranking de vendedores: tabla con monto ganado, cantidad de deals,
  tasa de conversión y actividades registradas. Visible solo para gerente y admin.

Además:
- Selector de período: este mes, trimestre, año, personalizado.
- Lista "Requieren atención": deals sin actividad hace más de 14 días.
- Lista "Tareas de hoy" con acción de completar en línea.
- Calcula las métricas en Postgres con vistas o funciones RPC, NO trayendo
  todas las filas al cliente para agregarlas en JavaScript.
```

---

## BLOQUE 5 — Configuración y pulido

```
=== /settings (solo admin) ===
- Usuarios: tabla de profiles, invitar por email (Edge Function que use
  supabase.auth.admin.inviteUserByEmail), cambiar rol, asignar manager_id,
  desactivar usuario.
- Pipelines y etapas: crear pipeline, agregar/renombrar/reordenar etapas
  con drag & drop, definir probabilidad por defecto y tipo (open/won/lost).
- Etiquetas: CRUD con selector de color.
- Perfil propio (todos los roles): nombre, avatar subido a Supabase Storage,
  cambio de contraseña.

=== Pulido final ===
- Búsqueda global en el header (Cmd+K): busca en contactos, empresas y
  oportunidades, agrupa los resultados por tipo, navega con teclado.
- Atajos: N = nuevo contacto, D = nueva oportunidad, T = nueva tarea.
- Error boundary global con pantalla de error decente y botón de reintentar.
- Página 404.
- Responsive real: en móvil el Kanban pasa a lista por etapa colapsable
  y la sidebar se vuelve un Sheet.
- Accesibilidad: foco visible, labels en todos los inputs, aria-label en
  botones de solo ícono, contraste AA.
- Revisa que no haya llamadas N+1: usa select con joins anidados de Supabase
  (ej: `select('*, company:companies(name), owner:profiles(full_name,avatar_url)')`).
```

---

## Notas prácticas

- **Si Lovable rompe algo:** describe el error exacto en vez de decir "no funciona". Lovable arregla mucho mejor con el mensaje de consola pegado.
- **RLS recursivo** es el error #1 en estos proyectos. Si ves `infinite recursion detected in policy`, pídele que mueva la lógica de la política a una función `SECURITY DEFINER`.
- **Usa el modo Chat de Lovable** para planear cambios grandes antes de dejar que edite archivos.
- **Conecta GitHub desde el día uno** para tener historial y poder revertir.
- **Antes de producción:** verifica que RLS esté activo en todas las tablas (Lovable a veces crea tablas sin habilitarlo), y que ninguna clave sensible esté en el frontend.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nexus-sales-flow-07.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0832f746-6b53-4148-a94b-a84af91b7b9e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
