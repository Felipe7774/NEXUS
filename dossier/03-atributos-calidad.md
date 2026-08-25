# 03 — Atributos de calidad y escenarios

## Estructura de un escenario de calidad (referencia)

Según Bass, Clements & Kazman, un escenario de calidad completo tiene 6 partes:

1. **Fuente del estímulo** — quién/qué genera el evento (usuario, sistema externo, otro proceso).
2. **Estímulo** — la condición que llega al sistema.
3. **Artefacto** — la parte del sistema afectada.
4. **Entorno** — el estado del sistema cuando ocurre el estímulo (producción, sobrecarga, etc.).
5. **Respuesta** — qué hace el sistema.
6. **Medida de la respuesta** — cómo se verifica/cuantifica esa respuesta.

## Matriz de atributos de calidad (priorizada)

Prioridad final, alineada con los drivers arquitectónicos ya definidos en la semana 2 (`02-riesgos-drivers.md`):

| Atributo | Prioridad | Justificación |
|---|---|---|
| Seguridad | Alta | Datos comerciales de terceros protegidos únicamente por Auth + RLS (11 tablas, 31+ políticas tras sumar `stakeholders`) — una falla expone datos entre clientes/usuarios. |
| Disponibilidad | Alta | Dependencia total de un proveedor externo único (Supabase), sin fallback ni caché offline. |
| Mantenibilidad | Media | Equipo chico, historial de código ya se perdió una vez. Bajó de "Media-Alta" del borrador porque ya hay 12 tests automatizados corriendo (`npm test` / Docker). |
| Rendimiento | Media | Consultas del pipeline/Kanban y reportes vía React Query + Postgres; sin datos de volumen real todavía — se mide recién en la semana 4. |
| Usabilidad | Media-Baja | Importa para el producto, pero no es lo que esta evaluación de arquitectura mide este ciclo. |
| Escalabilidad | Baja | Alcance académico actual, sin usuarios concurrentes reales previstos a corto plazo. |

## Escenarios de calidad

> Los primeros 3 fueron propuestos por IA y reformulados por el equipo para que la medida de respuesta sea concreta, no un placeholder. Los 3 siguientes son RNF **definidos ahora para Nexo CRM** — no existía un documento previo de Ingeniería de Software disponible, así que se redactaron directamente en este ciclo, derivados del esquema y el código real del proyecto.

### Escenario 1 — Seguridad (aislamiento entre organizaciones)

- **Fuente:** un usuario autenticado del CRM.
- **Estímulo:** intenta leer, vía la API de Supabase, contactos que pertenecen a otra organización/usuario.
- **Artefacto:** capa de datos (PostgreSQL + políticas RLS).
- **Entorno:** operación normal.
- **Respuesta:** la política RLS bloquea la consulta; no se devuelve ninguna fila ajena.
- **Medida de respuesta:** 0 filas ajenas devueltas en el 100% de los intentos, verificado con una prueba automatizada sobre las 11+ tablas con RLS, corrida en cada PR (no manual).

### Escenario 2 — Disponibilidad (caída del proveedor)

- **Fuente:** Supabase (proveedor externo).
- **Estímulo:** degradación o corte del servicio.
- **Artefacto:** la aplicación completa (frontend + server functions).
- **Entorno:** producción, horario laboral.
- **Respuesta:** la app muestra un estado de error identificable en vez de una pantalla en blanco o un crash silencioso.
- **Medida de respuesta:** el usuario ve un mensaje de error identificable en ≤3 segundos desde el fallo del proveedor, sin pantalla en blanco.

### Escenario 3 — Rendimiento (carga del pipeline)

- **Fuente:** usuario comercial.
- **Estímulo:** abre el tablero Kanban de pipeline con oportunidades cargadas.
- **Artefacto:** vista de pipeline (React Query + consulta a Supabase).
- **Entorno:** carga normal, conexión de oficina.
- **Respuesta:** el tablero termina de renderizarse e interactivo.
- **Medida de respuesta:** con 200 oportunidades cargadas, el tablero queda interactivo en ≤2 segundos, medido contra el build de producción (`npm run preview`), no contra `npm run dev`. Se contrasta con el dato real en la semana 4.

### Escenario 4 — Mantenibilidad (agregar un campo sin romper nada)

- **Fuente:** desarrollador del equipo.
- **Estímulo:** necesita agregar un campo nuevo a una tabla existente (como se hizo esta semana con los campos de salud de cuenta en `companies`).
- **Artefacto:** migración de base de datos + suite de tests.
- **Entorno:** desarrollo, antes de mergear a `main`.
- **Respuesta:** el cambio se implementa y el suite de tests corre sin fallos antes del merge.
- **Medida de respuesta:** `npm test` pasa al 100% antes de cada merge a `main`, y el cambio completo (migración + validación) toma menos de 1 día-persona.

### Escenario 5 — Usabilidad (primer uso sin capacitación)

- **Fuente:** un vendedor nuevo (rol `vendedor`, recién dado de alta en el sistema).
- **Estímulo:** necesita cargar su primera oportunidad comercial sin ayuda de un compañero.
- **Artefacto:** formulario de creación de oportunidad (pipeline).
- **Entorno:** primer uso, sin capacitación formal previa.
- **Respuesta:** logra crear la oportunidad completando el formulario por su cuenta.
- **Medida de respuesta:** lo logra en menos de 5 minutos desde el primer login, sin pedir ayuda — a validar con una prueba de usuario real, todavía no ejecutada.

### Escenario 6 — Escalabilidad (crecimiento de datos)

- **Fuente:** crecimiento normal del negocio.
- **Estímulo:** la base de una empresa crece a 5.000 contactos y 1.000 oportunidades.
- **Artefacto:** vistas de listado de `contacts` y `deals`.
- **Entorno:** uso normal, sin cambios de infraestructura.
- **Respuesta:** las vistas de listado siguen respondiendo sin degradación perceptible.
- **Medida de respuesta:** tiempo de respuesta del listado ≤2 segundos con ese volumen — a medir cuando exista un dataset de ese tamaño (no aplica todavía con datos reales).
