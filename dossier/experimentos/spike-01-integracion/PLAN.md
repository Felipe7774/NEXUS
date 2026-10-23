# Spike 1 — Plan previo de integración (Módulo 5)

Fecha: 16/10/2026, Colombia. Base observada: `72622d1b1f247957a6496f6fa2a64e361486d276`.
Este archivo se registra en un commit anterior a la implementación y a la primera corrida.

## Pregunta e hipótesis

Si el CRM necesitara generar una actividad tras mover una oportunidad, ¿conviene esperar
esa actividad en la misma petición o aceptar el cambio y materializarla después?

H1: con un receptor que demora 40 ms de forma controlada, la confirmación asíncrona
tendrá menor mediana de p95 de aceptación que la síncrona. No se presupone que el
tiempo hasta la actividad terminada sea menor. Una dependencia caída debe dejar
un evento durable recuperable, sin duplicar la actividad al repetir la entrega.

La automatización de seguimiento es una **capacidad propuesta para el experimento**.
Hoy `useMoveDeal` cambia `stage_id` y refresca `deals`; no crea actividades automáticamente.

## Diseño y alcance

- Usar Supabase **local y desechable**, con las migraciones reales del CRM, Auth y RLS.
- Crear usuarios, pipeline, etapas y oportunidades sintéticos exclusivos del spike.
- Comparar dos coordinaciones del mismo flujo: cambio de etapa → actividad de seguimiento.
- Síncrona: esperar el receptor HTTP y la actividad antes de devolver éxito.
- Asíncrona: confirmar cambio + evento durable; después un consumidor entrega por HTTP.
- Ambas usan el mismo registro durable para igualar la escritura y permitir reintentos.
  Se estudia acoplamiento temporal, no se compara una escritura volátil contra otra durable.
- Una tabla y funciones `m5_spike_*` se cargan solo como fixture local, fuera de migraciones.
- El receptor HTTP en loopback impone 40 ms de demora; no es un proveedor externo real.
- El consumidor del harness se ejecuta después de la aceptación; no hay RabbitMQ/Kafka,
  daemon productivo, reintentos distribuidos ni prueba de capacidad de un broker.

## Protocolo congelado antes de medir

1. Verificar que el destino es `http://127.0.0.1` o `http://localhost`; rechazar otros hosts.
2. Calentar con dos operaciones por modalidad, excluidas de estadísticas.
3. Ejecutar tres corridas por modalidad, ocho operaciones por corrida, concurrencia 1.
4. Alternar qué modalidad corre primero entre las corridas para reducir sesgo de orden.
5. Registrar por operación aceptación, finalización y ventana aceptación→actividad.
6. Registrar duración completa de cada corrida y throughput de operaciones completadas.
7. Calcular p95 por nearest-rank por corrida y mediana de los tres p95, sin mezclar
   percentiles de corridas ni presentar los 24 datos como una prueba de carga masiva.
8. Inyectar caída del receptor en ambas modalidades; observar aceptación y estado durable.
9. Recuperar el receptor, repetir entregas y confirmar una sola actividad por evento.
10. Intentar acceder como otro vendedor y usar una etapa de otro pipeline: deben fallar
    sin cambiar la oportunidad ni producir un evento.
11. Conservar JSON crudo y resumen sin claves, JWT, contraseñas ni datos personales.

## Criterios de éxito y de refutación

- Mismo efecto final: etapa solicitada, historial del trigger y una actividad por evento.
- Cero eventos accesibles a otro vendedor; comando y entrega ajenos rechazados.
- Etapa de otro pipeline: cero cambios y cero eventos (transacción revertida).
- Modalidad síncrona con caída: error al llamador y evento pendiente identificable.
- Asíncrona con caída: aceptación del evento; actividad ausente hasta recuperación.
- Entrega duplicada: una sola actividad. El UUID de evento es su clave idempotente.
- H1 se confirma o refuta con datos; una diferencia pequeña no prueba beneficio productivo.

Si una verificación funcional falla, la corrida se marca fallida y no se documenta
como resultado válido. Se conserva la evidencia y se corrige antes de repetir.

## Entorno y límites

Docker no está disponible en la estación actual. La primera ejecución real se hará
en GitHub Actions, sobre el Supabase local ya previsto en CI. Su SHA, Node, sistema,
fecha, demora, tamaño de muestra y resultados se registrarán en el artefacto.
No se usarán credenciales cloud ni se aplicará el fixture al proyecto desplegado.
Las cifras no son comparables directamente con EXP-001/002 (otra carga y operación).

El costo se evaluará por piezas nuevas, gestión de pendientes, idempotencia y operación;
no se inventará una factura cloud ni horas históricas. La adopción queda para revisión
del PR; no se declara un veredicto de comité ni aprobación de los otros integrantes.
