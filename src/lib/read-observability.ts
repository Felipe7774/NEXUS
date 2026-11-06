// Observabilidad minima de lecturas, aprobada en el ADR-008 el 29/10/2026.
// Los umbrales no se inventan aca: salen del plan de observabilidad de
// dossier/21-seguridad-y-operacion.md, seccion 6.
export const READ_OBSERVABILITY = Object.freeze({
  /** "Investigar lecturas mayores a 2.000 ms o timeout de 3.000 ms". */
  slowReadMs: 2000,
  /** "Mas de 2% en una ventana documentada de 15 minutos". */
  errorRate: 0.02,
  windowMs: 15 * 60 * 1000,
  /** Sin muestras suficientes una sola falla da 100% y la senal seria ruido. */
  minSamples: 20,
});

/**
 * Alcance declarado, senalado en la auditoria del 06/11/2026: la ventana de errores
 * vive en memoria **por observador**, no es una tasa global del sistema. En un
 * despliegue con varias instancias cada una evalua su propia ventana, y un proceso
 * que se recicla la pierde. Para una tasa global haria falta un destino externo,
 * que es parte del monitor sintetico que el ADR-008 todavia no implementa.
 */
export type ReadEvent = {
  /** Solo la ruta: la query puede llevar identificadores de propietario. */
  path: string;
  durationMs: number;
  status: number | null;
  failed: boolean;
  circuitOpen: boolean;
};

type Emit = (signal: string, detail: Record<string, unknown>) => void;

const defaultEmit: Emit = (signal, detail) => {
  // Sin pila de observabilidad contratada, el destino es el pipeline del host.
  console.warn(`[nexus:${signal}]`, JSON.stringify(detail));
};

export function createReadObserver({
  emit = defaultEmit,
  now = () => Date.now(),
}: { emit?: Emit; now?: () => number } = {}) {
  let samples: { at: number; failed: boolean }[] = [];
  // Rutas cuyo circuito estaba abierto en la ultima lectura observada.
  const abiertas = new Set<string>();
  // null, no 0: con un reloj que empieza cerca de cero, 0 bloquearia la primera alerta.
  let lastRateAlertAt: number | null = null;

  const prune = (t: number) => {
    samples = samples.filter((s) => t - s.at < READ_OBSERVABILITY.windowMs);
  };

  return {
    record(event: ReadEvent) {
      const t = now();
      samples.push({ at: t, failed: event.failed });
      prune(t);

      // Una emision por apertura, no por rechazo. El breaker marca cada respuesta
      // que corta durante el enfriamiento; sin este filtro la senal contaria rechazos
      // y el umbral del documento 21 cuenta aperturas: "3 aperturas en una hora".
      if (event.circuitOpen) {
        if (!abiertas.has(event.path)) {
          abiertas.add(event.path);
          emit("circuit-open", { path: event.path });
        }
      } else {
        abiertas.delete(event.path);
        if (event.failed) emit("read-failed", { path: event.path, status: event.status });
        else if (event.durationMs > READ_OBSERVABILITY.slowReadMs)
          emit("slow-read", { path: event.path, durationMs: Math.round(event.durationMs) });
      }

      if (samples.length < READ_OBSERVABILITY.minSamples) return;
      const failed = samples.filter((s) => s.failed).length;
      const rate = failed / samples.length;
      // Una alerta por ventana: repetirla en cada request la vuelve ignorable.
      const fueraDeVentana =
        lastRateAlertAt === null || t - lastRateAlertAt >= READ_OBSERVABILITY.windowMs;
      if (rate > READ_OBSERVABILITY.errorRate && fueraDeVentana) {
        lastRateAlertAt = t;
        emit("error-rate", { failed, samples: samples.length, rate: Number(rate.toFixed(4)) });
      }
    },
    /** Para una sonda o un panel; no se expone por HTTP. */
    snapshot() {
      prune(now());
      const failed = samples.filter((s) => s.failed).length;
      return { samples: samples.length, failed };
    },
  };
}

export type ReadObserver = ReturnType<typeof createReadObserver>;
