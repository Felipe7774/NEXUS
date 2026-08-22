# 04 — Medición de línea base

> Esta semana depende de que la semana 3 ya tenga al menos un escenario de **rendimiento** con una medida de respuesta concreta (no placeholder). No corran la medición todavía si eso no está cerrado — el dato real se contrasta contra el escenario, en ese orden.

## Herramienta elegida

`[COMPLETAR]`: k6, JMeter o Locust. Recomendación para este proyecto: **k6** — es liviano, corre bien contra un dev server local en Windows, y los scripts son JS (coherente con el resto del stack).

### Instalación (Windows, con Chocolatey)

```bash
choco install k6
```

O sin Chocolatey, descargando el binario desde https://k6.io/docs/get-started/installation/.

## Script de medición base (`/experimentos/pipeline-load.js`)

Apunta al servidor local (`npm run dev`, puerto 3000) o a un `npm run preview` (build de producción), no al deploy real, salvo que el equipo decida explícitamente medir contra producción.

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,           // usuarios virtuales simultáneos — ajustar según el escenario a validar
  duration: "30s",
};

export default function () {
  const res = http.get("http://localhost:3000/"); // reemplazar por la ruta real del pipeline/kanban
  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(1);
}
```

Correr con:

```bash
k6 run experimentos/pipeline-load.js
```

## Registro de condiciones (completar con datos reales de la corrida)

| Campo | Valor |
|---|---|
| Fecha y hora | `[COMPLETAR]` |
| Build medido | `[COMPLETAR: dev / preview / producción]` |
| Hardware | `[COMPLETAR]` |
| Red | `[COMPLETAR: local / oficina / etc.]` |
| Volumen de datos en la DB al momento de medir | `[COMPLETAR: cantidad de oportunidades/contactos]` |
| Usuarios virtuales / duración | `[COMPLETAR]` |
| Resultado (p95, avg, error rate) | `[COMPLETAR]` |

## Qué invalidaría esta medición

Ejemplos a evaluar y ajustar según lo que realmente pase en la corrida:

- Medir contra el dev server (`vite dev`) en vez del build de producción — el dev server no está optimizado y da tiempos peores de los reales.
- Base de datos con muy pocos registros — no representa el volumen real de uso.
- Correr la medición desde la misma máquina que sirve la app, compitiendo por CPU/red con el propio proceso.
- Plan free de Supabase con *cold starts* o *rate limiting* que no aplicarían en un plan pago.

## Contraste escenario formulado vs. dato real

| | Escenario (semana 3) | Dato real medido |
|---|---|---|
| Medida de respuesta esperada | `[pegar la medida del escenario de rendimiento de 03-atributos-calidad.md]` | |
| Resultado obtenido | | `[COMPLETAR con el resultado de k6]` |
| ¿Se cumplió? | `[COMPLETAR: sí/no y por qué]` | |

## Carpeta `/experimentos`

```
experimentos/
  pipeline-load.js       # script de k6
  resultados/
    YYYY-MM-DD-baseline.txt   # output crudo de la corrida (k6 run > archivo)
```
