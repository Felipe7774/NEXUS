# 03 — Atributos de calidad y escenarios

## Estructura de un escenario de calidad (referencia)

Según Bass, Clements & Kazman, un escenario de calidad completo tiene 6 partes:

1. **Fuente del estímulo** — quién/qué genera el evento (usuario, sistema externo, otro proceso).
2. **Estímulo** — la condición que llega al sistema.
3. **Artefacto** — la parte del sistema afectada.
4. **Entorno** — el estado del sistema cuando ocurre el estímulo (producción, sobrecarga, etc.).
5. **Respuesta** — qué hace el sistema.
6. **Medida de la respuesta** — cómo se verifica/cuantifica esa respuesta.

## Matriz de atributos de calidad (propuesta a priorizar y justificar)

| Atributo | Prioridad propuesta | Justificación (borrador) |
|---|---|---|
| Seguridad | Alta | Datos comerciales de terceros protegidos únicamente por Auth + RLS (11 tablas, 31 políticas) — una falla expone datos entre clientes/usuarios. |
| Disponibilidad | Alta | Dependencia total de un proveedor externo único (Supabase), sin fallback ni caché offline. |
| Mantenibilidad | Media-Alta | Equipo chico, sin tests automatizados, historial de código ya se perdió una vez. |
| Rendimiento | Media | Consultas del pipeline/Kanban y reportes agregan datos vía React Query + Postgres; sin datos de volumen real todavía. |
| Usabilidad | Media | Uso diario por equipos comerciales; el README ya declara "interfaz densa y agradable" como objetivo explícito del producto. |
| Escalabilidad | Baja | Alcance académico actual, sin usuarios concurrentes reales previstos a corto plazo. |

`[COMPLETAR]`: el equipo debe reordenar/ajustar prioridades con su propio criterio y agregar la justificación final (la de arriba es punto de partida, no el resultado).

## Escenarios propuestos por IA (para reformular y hacer medibles)

> Consigna: revisar que cada medida de respuesta sea realmente verificable con datos de este proyecto puntual, no genérica.

### Escenario 1 — Seguridad (aislamiento entre organizaciones)

- **Fuente:** un usuario autenticado del CRM.
- **Estímulo:** intenta leer, vía la API de Supabase, contactos que pertenecen a otra organización/usuario.
- **Artefacto:** capa de datos (PostgreSQL + políticas RLS).
- **Entorno:** operación normal.
- **Respuesta:** la política RLS bloquea la consulta; no se devuelve ninguna fila ajena.
- **Medida de respuesta (borrador, a afinar):** 0 filas ajenas devueltas en el 100% de los intentos, verificado con una prueba automatizada contra las 11 tablas con RLS.

### Escenario 2 — Disponibilidad (caída del proveedor)

- **Fuente:** Supabase (proveedor externo).
- **Estímulo:** degradación o corte del servicio.
- **Artefacto:** la aplicación completa (frontend + server functions).
- **Entorno:** producción, horario laboral.
- **Respuesta:** la app muestra un estado de error identificable en vez de una pantalla en blanco o un crash silencioso.
- **Medida de respuesta (borrador, a afinar):** el usuario ve un mensaje de error en menos de X segundos desde el fallo — *este número hay que definirlo con el equipo, no está medido todavía*.

### Escenario 3 — Rendimiento (carga del pipeline)

- **Fuente:** usuario comercial.
- **Estímulo:** abre el tablero Kanban de pipeline con N oportunidades cargadas.
- **Artefacto:** vista de pipeline (React Query + consulta a Supabase).
- **Entorno:** carga normal, conexión de oficina.
- **Respuesta:** el tablero termina de renderizarse.
- **Medida de respuesta (borrador, a afinar):** tiempo de carga inicial objetivo — *placeholder, se contrasta contra el dato real en la semana 4 (`04-escenarios-calidad.md`)*.

`[COMPLETAR]`: falta incorporar los RNF ya verificados en Ingeniería de Software como escenarios adicionales — pasame ese documento cuando lo tengas para redactarlos juntos.
