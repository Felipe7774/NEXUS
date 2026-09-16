import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

// Fitness function de la restriccion declarada por el equipo en
// dossier/01-contexto-y-drivers.md: "service_role solo en *.server.ts".
// Hasta ahora esa restriccion existia solo como texto; este test la vuelve
// ejecutable y la corre en cada PR. Cubre el riesgo R1 (fuga de service_role)
// y el componente #9 del modelo C4 (dossier/modeloc4-nivel.md).

const SRC = join(process.cwd(), "src");
const PRIVILEGED_CLIENT = "src/integrations/supabase/client.server.ts";

// \b evita que SUPABASE_SERVICE_ROLE_KEY_TEST cuente como violacion: esa
// variable es de los tests de integracion y no viaja al bundle del navegador.
const PRIVILEGED_ENV = /\bSUPABASE_SERVICE_ROLE_KEY\b/;

const PRIVILEGED_IMPORT = /(?:from\s*|import\s*\(\s*|require\s*\(\s*)["'][^"']*client\.server["']/;

type Kind = "checker" | "test" | "server" | "client";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function classify(relPath: string): Kind {
  if (relPath.startsWith("architecture/")) return "checker";
  if (/\.(test|spec)\.tsx?$/.test(relPath)) return "test";
  if (/\.server\.ts$/.test(relPath)) return "server";
  return "client";
}

const files = walk(SRC)
  .filter((f) => /\.tsx?$/.test(f))
  .map((full) => {
    // Rutas normalizadas a "/" para que los mensajes de error sean identicos
    // en Windows local y en el runner Linux de CI.
    const relPath = relative(SRC, full).split(sep).join("/");
    return { relPath, kind: classify(relPath), source: readFileSync(full, "utf8") };
  });

const clientFiles = files.filter((f) => f.kind === "client");

describe("frontera del cliente privilegiado (service_role)", () => {
  it("encuentra archivos para analizar", () => {
    expect(clientFiles.length).toBeGreaterThan(0);
  });

  it("ningun modulo de cliente importa el cliente privilegiado", () => {
    const violations = clientFiles
      .filter((f) => PRIVILEGED_IMPORT.test(f.source))
      .map((f) => f.relPath);

    expect(
      violations,
      `Estos archivos importan client.server pero no son *.server.ts. ` +
        `El cliente con service_role bypassa RLS: si viaja al bundle del ` +
        `navegador, se rompe el aislamiento entre usuarios que verifica el ` +
        `Escenario 1. Mover la logica a un archivo *.server.ts.`,
    ).toEqual([]);
  });

  it("ningun modulo de cliente referencia la clave service_role", () => {
    const violations = clientFiles
      .filter((f) => PRIVILEGED_ENV.test(f.source))
      .map((f) => f.relPath);

    expect(
      violations,
      `Estos archivos referencian SUPABASE_SERVICE_ROLE_KEY fuera de un ` +
        `archivo *.server.ts. Solo el codigo de servidor puede leer esa clave.`,
    ).toEqual([]);
  });

  it("el cliente privilegiado sigue donde el modelo C4 dice que esta", () => {
    // Si este test falla, el componente #9 de dossier/modeloc4-nivel.md quedo
    // desactualizado respecto del codigo: hay que corregir el diagrama.
    const exists = files.some((f) => `src/${f.relPath}` === PRIVILEGED_CLIENT);
    expect(exists, `No se encontro ${PRIVILEGED_CLIENT}`).toBe(true);
  });
});

// Limite conocido de esta prueba: detecta importaciones directas y referencias
// literales a la variable de entorno. No sigue cadenas transitivas (un archivo
// de cliente que importe un helper que a su vez importe client.server no se
// detecta hoy). Se documenta en vez de sobrevender el alcance.
