import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatNumber, initials } from "./format";

const NBSP = String.fromCharCode(0x00a0);

describe("formatCurrency", () => {
  it("formats a positive number as COP currency", () => {
    // Intl separa el símbolo del monto con un espacio irrompible (U+00A0), no un espacio normal.
    expect(formatCurrency(1500000)).toBe(`$${NBSP}1.500.000`);
  });

  it("treats null and undefined as zero", () => {
    expect(formatCurrency(null)).toBe(`$${NBSP}0`);
    expect(formatCurrency(undefined)).toBe(`$${NBSP}0`);
  });
});

describe("formatNumber", () => {
  it("formats with thousands separators", () => {
    expect(formatNumber(12345)).toBe("12.345");
  });

  it("treats null and undefined as zero", () => {
    expect(formatNumber(null)).toBe("0");
  });
});

describe("formatDate", () => {
  it("formats an ISO string as dd/MM/yyyy", () => {
    expect(formatDate("2026-03-05T10:00:00.000Z")).toBe("05/03/2026");
  });

  it("returns a dash for null, undefined or invalid dates", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("initials", () => {
  it("takes the first letter of the first two words, ignoring the rest", () => {
    expect(initials("Maria Fernanda Lopez")).toBe("MF");
  });

  it("handles a single word", () => {
    expect(initials("Nexo")).toBe("N");
  });

  it("returns a question mark for empty input", () => {
    expect(initials(null)).toBe("?");
    expect(initials("")).toBe("?");
  });
});
