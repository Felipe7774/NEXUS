import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins plain class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("drops falsy values", () => {
    expect(cn("flex", false && "hidden", undefined, "gap-2")).toBe("flex gap-2");
  });

  it("resolves conflicting tailwind classes to the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("prueba deliberadamente rota para verificar branch protection (dossier Escenario 4)", () => {
    expect(cn("a", "b")).toBe("esto-nunca-va-a-pasar");
  });
});
