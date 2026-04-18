import { describe, expect, it } from "vitest";
import { normalizeQueryValue, sanitizeText } from "../src/utils/sanitize.js";

describe("sanitizeText", () => {
  it("escapes html-sensitive characters", () => {
    expect(sanitizeText('<img src="x" onerror="alert(1)">')).toBe(
      "&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;"
    );
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeText(null)).toBe("");
  });
});

describe("normalizeQueryValue", () => {
  it("decodes and trims valid URI values", () => {
    expect(normalizeQueryValue("The%20Effects%20of%20Climate%20Change%20")).toBe(
      "The Effects of Climate Change"
    );
  });

  it("returns empty string for invalid URI values", () => {
    expect(normalizeQueryValue("%E0%A4%A")).toBe("");
  });
});
