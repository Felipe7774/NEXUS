import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { projectFiles } from "archunit";
import { persistenceViolations } from "./persistence-rules";

function productionFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const target = join(path, entry.name);
    return entry.isDirectory()
      ? productionFiles(target)
      : /\.tsx?$/.test(target) && !/\.test\.tsx?$/.test(target)
        ? [target]
        : [];
  });
}
describe("ADR 0004: propiedad de persistencia", () => {
  it("todas las consultas productivas respetan al propietario y sus JOINs", () => {
    const violations = productionFiles("src").flatMap((path) =>
      persistenceViolations(path, readFileSync(path, "utf8")).map((error) => path + ": " + error),
    );
    expect(violations).toEqual([]);
  });
  it("ArchUnitTS detecta ciclos en los módulos", async () => {
    expect(await projectFiles().inFolder("src/modules/**").should().haveNoCycles().check()).toEqual(
      [],
    );
  }, 60000);
  it("los módulos no dependen de composición ni presentación", async () => {
    for (const folder of ["src/lib/**", "src/hooks/**", "src/routes/**"]) {
      // The common fetch adapter belongs to infrastructure, not module orchestration.
      const violations = await projectFiles()
        .inFolder("src/modules/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder(folder)
        .check();
      expect(violations).toEqual([]);
    }
  }, 60000);
  it.each([
    ['supabase.from("companies").select("*")', "Persistencia ajena"],
    ['supabase.from("deals").select("*, companies(id, name)")', "JOIN ajeno"],
    ["supabase.from(table)", "Tabla dinámica"],
    ['supabase["from"]("deals")', "Acceso calculado"],
    ['import { db } from "@/modules/relationships/private";', "Importación privada"],
  ])("rechaza una violación deliberada: %s", (source, message) => {
    expect(persistenceViolations("src/modules/sales/api.ts", source).join(";")).toContain(message);
  });
});
