# 01 — Contexto del sistema

> Borrador base. Los campos marcados `[COMPLETAR]` necesitan un dato que solo ustedes tienen (nombre de la materia/docente, criterios de evaluación puntuales, decisiones internas del equipo).

## Sistema adoptado

- **Nombre:** Nexo CRM
- **Descripción:** CRM B2B para gestionar contactos, empresas, oportunidades y actividades comerciales desde una única interfaz.
- **Repositorio de código:** https://github.com/Felipe7774/NEXUS (rama `main`)
- **Origen:** proyecto iniciado por el equipo (frontend propio + backend de un compañero); el código actual reemplazó una versión anterior del frontend que no se conservó — la fuente de verdad es este repositorio, no copias locales sueltas.
- **Opción adoptada:** [COMPLETAR: A/B/C según la consigna del profe]

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript |
| Framework full-stack | TanStack Start (SSR) + TanStack Router + React Query |
| Build | Vite 8 + Nitro |
| UI | Tailwind CSS + Radix UI |
| Backend / datos | Supabase (PostgreSQL + Auth + Row Level Security) |
| Hosting previsto | Vercel |

No hay un servicio de backend separado y desplegable de forma independiente: la lógica de servidor (middlewares de auth, cliente admin) vive dentro del mismo proceso Vite/Nitro como *server functions* (`src/integrations/supabase/*.server.ts`).

## Cómo se ejecuta localmente

```bash
git clone https://github.com/Felipe7774/NEXUS.git
cd NEXUS
npm install
cp .env.example .env   # completar con las claves (ver abajo)
npm run dev             # http://localhost:3000
```

Requisitos: Node.js ≥ 20, npm ≥ 10.

### Cómo obtener las claves de Supabase

El `.env` necesita `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (más sus equivalentes sin prefijo `VITE_` para el lado servidor). Se consiguen así, por quien administra el proyecto de Supabase:

1. Entrar a [supabase.com/dashboard](https://supabase.com/dashboard) → abrir el proyecto (`project_id` en `supabase/config.toml`).
2. **Project Settings → API Keys**.
3. Copiar **Project URL** y la clave **anon / publishable** (no la `service_role`, que es privada y solo se usa del lado servidor).

Esta clave anon/publishable no es secreta en el sentido estricto (está diseñada para viajar al navegador), pero solo el dueño del proyecto Supabase puede generarla/consultarla.

## Stakeholders

| Stakeholder | Rol | Interés / expectativa | Influencia |
|---|---|---|---|
| Equipo de desarrollo (2 personas) | Frontend / Backend | Entregar el CRM funcional y aprobar la materia | Alta |
| Usuarios finales (equipos comerciales B2B) | Usuarios del CRM | Interfaz rápida, clara, sin fricción para cargar/consultar oportunidades | Alta |
| Dueño del proyecto Supabase (compañero) | Administrador de infraestructura | Control de acceso, costos del plan, disponibilidad | Alta |
| Docente / evaluador de la materia | Evaluador | Calidad del proceso de arquitectura (no solo el código) | Alta |
| Supabase (proveedor externo) | Proveedor de Auth + DB | SLA, límites del plan, continuidad del servicio | Media |
| Vercel (proveedor externo, si se despliega) | Proveedor de hosting | Límites del plan gratuito | Baja/Media |

## Restricciones técnicas

- Stack fijo por decisión previa del equipo: React 19 + TanStack Start + Supabase — no hay margen para cambiar de proveedor de backend sin reescribir la capa de datos.
- Sin suite de pruebas automatizadas a la fecha (no hay script `test` en `package.json`, ni Vitest/Jest instalados).
- La clave `service_role` de Supabase solo debe usarse en módulos `*.server.ts`; si se importa por error en un archivo que termina en el bundle del cliente, se expone a cualquier usuario del navegador.
- Versiones de dependencias muy recientes (React 19, Vite 8, TanStack Start) — menor cantidad de documentación y mayor probabilidad de bugs de tooling no relacionados al código propio.

## Restricciones económicas

- Proyecto Supabase en plan gratuito: límites de filas, ancho de banda y conexiones simultáneas del *free tier*.
- Sin presupuesto para infraestructura paga — cualquier prueba de carga (semana 4) debe mantenerse dentro de esos límites para no generar costos ni bloqueos temporales de la cuenta.

## Restricciones organizacionales

- Equipo de 2 integrantes, con separación de responsabilidades (frontend / backend-infraestructura).
- Un solo integrante administra la cuenta de Supabase: es un punto único de dependencia para acceso, claves y decisiones de base de datos.
- Cronograma fijo de la materia: 4 semanas, con checkpoint en la semana 2 y entregas vía Pull Request.
- [COMPLETAR: disponibilidad horaria real del equipo, si hay más restricciones que imponga la cátedra]
