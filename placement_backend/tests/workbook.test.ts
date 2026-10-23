import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Workbook Data Fidelity & Source of Truth", () => {
  const jsonPath = path.resolve(__dirname, "../data/parsed_workbook.json");

  it("Parsed workbook exists and contains valid JSON", () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const content = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(content);
    expect(Array.isArray(data)).toBe(true);
  });

  it("Contains exactly 15 patterns matching the Excel cheat sheet", () => {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    expect(data.length).toBe(15);

    const patternNames = data.map((p: any) => p.name);
    expect(patternNames).toContain("Two Pointers");
    expect(patternNames).toContain("Fast & Slow pointers");
    expect(patternNames).toContain("Sliding Window");
    expect(patternNames).toContain("Kadane pattern");
    expect(patternNames).toContain("PREFIX SUM");
    expect(patternNames).toContain("Binary Search");
    expect(patternNames).toContain("Stack");
    expect(patternNames).toContain("DP (Dynamic Programming)");
  });

  it("Contains exactly 189 questions extracted from the Excel rows", () => {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const totalQuestions = data.reduce((sum: number, p: any) => sum + p.questions.length, 0);
    expect(totalQuestions).toBe(189);
  });

  it("Every problem has a valid title, and URLs (when present) are valid http(s) links", () => {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    let urlCount = 0;
    let missingUrlCount = 0;

    for (const pattern of data) {
      for (const q of pattern.questions) {
        expect(q.title).toBeDefined();
        expect(q.title.trim().length).toBeGreaterThan(0);
        if (q.leetcode_url) {
          expect(q.leetcode_url).toMatch(/^https?:\/\//);
          urlCount++;
        } else {
          missingUrlCount++;
        }
      }
    }

    // 185 have valid links, exactly 4 conceptual episode rows had no URL in the sheet
    expect(urlCount).toBe(185);
    expect(missingUrlCount).toBe(4);
  });

  it("No duplicate problem titles within the same pattern", () => {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    for (const pattern of data) {
      const titles = pattern.questions.map((q: any) => q.title.toLowerCase().trim());
      const uniqueTitles = new Set(titles);
      expect(titles.length).toBe(uniqueTitles.size);
    }
  });
});
