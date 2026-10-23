# Defensa individual M6 — guion de 9 minutos

Preparación asistida por IA. No acredita una defensa realizada ni reemplaza la
explicación propia del estudiante. Abrir el dossier y los resultados antes de iniciar.

| Tiempo    | Qué demostrar                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–1:00 | Pregunta: qué falla al crecer 10×. Diferenciar app, red y Supabase; presentar apuesta e2dc488 antes del experimento                                                              |
| 1:00–3:00 | Gráficas k6, una corrida descartada y tres válidas. Leer p95, errores y throughput útil; explicar si la predicción se refuta y el límite de atribución al generador              |
| 3:00–4:30 | Breaker: 3 fallos, abierto, espera 1 s, una sonda. EXP-004 reduce intentos 95,83%; durante caída ambas variantes tienen 100% errores                                             |
| 4:30–6:00 | Mostrar propietarios `identity`, `relationships`, `sales`, `followup`; composición por APIs sin JOIN entre contextos. Ejecutar fitness y señalar casos deliberadamente inválidos |
| 6:00–7:30 | ADR: app modular con Supabase, alternativa dos servicios y alternativa worker. Costos hipotéticos, infraestructura/operación/Conway y reversibilidad                             |
| 7:30–9:00 | Reproducir comandos, admitir límites y responder cambio sorpresa; comité/merge siguen pendientes                                                                                 |

Comandos desde la raíz (Docker debe estar funcionando):

```sh
npm ci
npm run docker:test
npm run docker:growth
node experimentos/crecimiento-S11/summarize.mjs
```

La carga dura unos 12 minutos con preparación/limpieza; durante la defensa mostrar
una ejecución previamente conservada y el comando, no prometer terminar todo en 9 minutos.

Preguntas para responder con palabras propias:

- **¿El breaker aumenta disponibilidad?** El experimento acredita menor presión y
  espera en fallo; no aumenta operaciones útiles durante la caída.
- **¿DB separada por servicio implica otro servidor?** No; la propiedad y el
  contrato importan. Aquí hay fronteras de código y RLS, con esquema y FKs compartidos.
- **¿Por qué no subir el pool?** Falta medir esperas/conexiones y capacidad de DB;
  un pool mayor podría trasladar la saturación.
- **Sorpresa: Seguimiento necesita despliegues independientes.** Revisar outbox,
  idempotencia, consistencia y costo de worker; no dividir primero todas las tablas.
- **Sorpresa: escrituras deben funcionar si cae Supabase.** El breaker actual no
  cumple eso. Requiere rediseñar aceptación durable y sincronización con métricas nuevas.
- **Sorpresa: 200 VUs no alcanzan el presupuesto.** Identificar instrumento/host,
  trazar DB/REST y repetir antes de afirmar que microservicios arreglarán la demora.

Acta de defensa y comité: **pendiente**, sin asistentes, votos ni aprobaciones inventados.
