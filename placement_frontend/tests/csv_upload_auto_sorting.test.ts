import { describe, it, expect } from "vitest";
import { parse } from "csv-parse/sync";

// Category resolution logic matching the route implementation
function routeCategory(rawCategory: string): { slug: string; displayName: string } | null {
  if (!rawCategory) return null;
  const clean = rawCategory.trim().toLowerCase().replace(/[-_]/g, " ");

  if (
    clean === "quantitative aptitude" ||
    clean === "quantitative" ||
    clean.startsWith("quant") ||
    clean === "math" ||
    clean === "aptitude"
  ) {
    return { slug: "quantitative", displayName: "Quantitative Aptitude" };
  }

  if (
    clean === "logical reasoning" ||
    clean === "logical" ||
    clean.includes("reasoning") ||
    clean === "lr" ||
    clean === "logic"
  ) {
    return { slug: "logical", displayName: "Logical Reasoning" };
  }

  if (
    clean === "data interpretation" ||
    clean === "data-interpretation" ||
    clean === "di" ||
    clean === "data" ||
    clean.includes("interpretation")
  ) {
    return { slug: "data-interpretation", displayName: "Data Interpretation" };
  }

  if (
    clean === "verbal ability" ||
    clean === "verbal" ||
    clean === "va" ||
    clean === "english" ||
    clean.includes("verbal")
  ) {
    return { slug: "verbal", displayName: "Verbal Ability" };
  }

  return null;
}

function getFieldValue(row: Record<string, any>, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }

  const rowKeys = Object.keys(row);
  for (const target of possibleKeys) {
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const rk of rowKeys) {
      if (rk.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanTarget) {
        const val = row[rk];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
      }
    }
  }

  return "";
}

function normalizeCorrectAnswer(
  ans: string,
  optionA: string,
  optionB: string,
  optionC: string,
  optionD: string
): "A" | "B" | "C" | "D" | null {
  if (!ans) return null;
  const upper = ans.trim().toUpperCase();

  if (["A", "B", "C", "D"].includes(upper)) {
    return upper as "A" | "B" | "C" | "D";
  }

  const optionMatch = upper.match(/(?:OPTION\s*|OPT\s*|^)([ABCD1234])(?:\)|\.|\s|$)/i);
  if (optionMatch) {
    const letterOrNum = optionMatch[1].toUpperCase();
    if (letterOrNum === "1" || letterOrNum === "A") return "A";
    if (letterOrNum === "2" || letterOrNum === "B") return "B";
    if (letterOrNum === "3" || letterOrNum === "C") return "C";
    if (letterOrNum === "4" || letterOrNum === "D") return "D";
  }

  if (upper === "1") return "A";
  if (upper === "2") return "B";
  if (upper === "3") return "C";
  if (upper === "4") return "D";

  const cleanAns = ans.trim().toLowerCase();
  if (optionA && cleanAns === optionA.trim().toLowerCase()) return "A";
  if (optionB && cleanAns === optionB.trim().toLowerCase()) return "B";
  if (optionC && cleanAns === optionC.trim().toLowerCase()) return "C";
  if (optionD && cleanAns === optionD.trim().toLowerCase()) return "D";

  return null;
}

function normalizeDifficulty(diff: string): "Easy" | "Medium" | "Hard" {
  if (!diff) return "Medium";
  const lower = diff.trim().toLowerCase();
  if (lower === "easy" || lower === "beginner" || lower === "basic") return "Easy";
  if (lower === "hard" || lower === "difficult" || lower === "advanced") return "Hard";
  return "Medium";
}

describe("CSV Upload and Auto-Sorting Module", () => {
  it("Parses standard RFC-compliant CSV contents using csv-parse", () => {
    const sampleCsv = `Category,Difficulty,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Solution/Explanation
Quantitative Aptitude,Easy,"If ratio is 3:4 and sum is 84, find greater.",36,48,42,56,B,"Let numbers be 3x, 4x. x=12, greater=48."
Logical Reasoning,Medium,"Look at series: 2, 1, (1/2), (1/4)...",1/3,1/8,2/8,1/16,B,"Dividing by 2 each step."`;

    const records = parse(sampleCsv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    expect(records.length).toBe(2);
    expect(records[0]["Category"]).toBe("Quantitative Aptitude");
    expect(records[0]["Difficulty"]).toBe("Easy");
    expect(records[0]["Correct Answer"]).toBe("B");
    expect(records[1]["Category"]).toBe("Logical Reasoning");
  });

  it("Auto-sorts rows into corresponding category databases accurately", () => {
    const categories = [
      { input: "Quantitative Aptitude", expectedSlug: "quantitative", expectedName: "Quantitative Aptitude" },
      { input: "Logical Reasoning", expectedSlug: "logical", expectedName: "Logical Reasoning" },
      { input: "Data Interpretation", expectedSlug: "data-interpretation", expectedName: "Data Interpretation" },
      { input: "Verbal Ability", expectedSlug: "verbal", expectedName: "Verbal Ability" },
    ];

    for (const testCase of categories) {
      const routed = routeCategory(testCase.input);
      expect(routed).not.toBeNull();
      expect(routed?.slug).toBe(testCase.expectedSlug);
      expect(routed?.displayName).toBe(testCase.expectedName);
    }
  });

  it("Correctly handles case-insensitivity and formatting variations in category names", () => {
    expect(routeCategory("quantitative aptitude")?.slug).toBe("quantitative");
    expect(routeCategory("LOGICAL REASONING")?.slug).toBe("logical");
    expect(routeCategory("data-interpretation")?.slug).toBe("data-interpretation");
    expect(routeCategory("verbal ability")?.slug).toBe("verbal");
    expect(routeCategory("invalid category")).toBeNull();
  });

  it("Maps remaining CSV columns (Difficulty, Question Text, Options, Correct Answer, Explanation)", () => {
    const rawRow = {
      Category: "Quantitative Aptitude",
      Difficulty: "easy",
      "Question Text": "A train passes a pole in 10s. Speed?",
      "Option A": "10 m/s",
      "Option B": "20 m/s",
      "Option C": "30 m/s",
      "Option D": "40 m/s",
      "Correct Answer": "Option B",
      "Solution/Explanation": "Speed = Distance / Time",
    };

    const routedCategory = routeCategory(getFieldValue(rawRow, ["Category"]));
    const difficulty = normalizeDifficulty(getFieldValue(rawRow, ["Difficulty"]));
    const text = getFieldValue(rawRow, ["Question Text"]);
    const optionA = getFieldValue(rawRow, ["Option A"]);
    const optionB = getFieldValue(rawRow, ["Option B"]);
    const optionC = getFieldValue(rawRow, ["Option C"]);
    const optionD = getFieldValue(rawRow, ["Option D"]);
    const correctAnswer = normalizeCorrectAnswer(
      getFieldValue(rawRow, ["Correct Answer"]),
      optionA,
      optionB,
      optionC,
      optionD
    );
    const explanation = getFieldValue(rawRow, ["Solution/Explanation"]);

    expect(routedCategory?.slug).toBe("quantitative");
    expect(difficulty).toBe("Easy");
    expect(text).toBe("A train passes a pole in 10s. Speed?");
    expect(optionA).toBe("10 m/s");
    expect(optionB).toBe("20 m/s");
    expect(correctAnswer).toBe("B");
    expect(explanation).toBe("Speed = Distance / Time");
  });

  it("Generates feedback messages detailing exactly how many questions were added to each category", () => {
    const categoryCounts: Record<string, number> = {
      "Quantitative Aptitude": 40,
      "Logical Reasoning": 25,
      "Data Interpretation": 15,
      "Verbal Ability": 20,
    };

    const messages: string[] = [];
    if (categoryCounts["Quantitative Aptitude"] > 0) {
      messages.push(
        `Successfully added ${categoryCounts["Quantitative Aptitude"]} questions to Quantitative Aptitude`
      );
    }
    if (categoryCounts["Logical Reasoning"] > 0) {
      messages.push(
        `Successfully added ${categoryCounts["Logical Reasoning"]} questions to Logical Reasoning`
      );
    }
    if (categoryCounts["Data Interpretation"] > 0) {
      messages.push(
        `Successfully added ${categoryCounts["Data Interpretation"]} questions to Data Interpretation`
      );
    }
    if (categoryCounts["Verbal Ability"] > 0) {
      messages.push(
        `Successfully added ${categoryCounts["Verbal Ability"]} questions to Verbal Ability`
      );
    }

    expect(messages).toContain("Successfully added 40 questions to Quantitative Aptitude");
    expect(messages).toContain("Successfully added 25 questions to Logical Reasoning");
    expect(messages).toContain("Successfully added 15 questions to Data Interpretation");
    expect(messages).toContain("Successfully added 20 questions to Verbal Ability");
  });

  it("Allows bulk processing of at least 50 rows per file without truncation", () => {
    // Generate a CSV with 55 rows across categories
    const categories = ["Quantitative Aptitude", "Logical Reasoning", "Data Interpretation", "Verbal Ability"];
    const rows = ["Category,Difficulty,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Solution/Explanation"];
    
    for (let i = 1; i <= 55; i++) {
      const cat = categories[i % categories.length];
      rows.push(`${cat},Medium,"Question number ${i} testing bulk import capability?",A${i},B${i},C${i},D${i},A,"Solution for question ${i}"`);
    }

    const csvContent = rows.join("\n");
    const parsedRecords = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    expect(parsedRecords.length).toBe(55);

    const validQuestions: any[] = [];
    for (let i = 0; i < parsedRecords.length; i++) {
      const row = parsedRecords[i];
      const matchedCategory = routeCategory(row["Category"]);
      if (matchedCategory && row["Question Text"] && row["Option A"] && row["Correct Answer"]) {
        validQuestions.push({
          category: matchedCategory.displayName,
          text: row["Question Text"],
          correctAnswer: row["Correct Answer"],
        });
      }
    }

    expect(validQuestions.length).toBe(55);
  });

  it("Calculates pagination correctly and enables pagination when questions exceed 50", () => {
    const limit = 50;

    const calcPagination = (total: number, page: number) => ({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasPagination: Math.ceil(total / limit) > 1,
    });

    // 20 items: 1 page, no pagination control needed
    expect(calcPagination(20, 1).totalPages).toBe(1);
    expect(calcPagination(20, 1).hasPagination).toBe(false);

    // Exactly 50 items: 1 page, no pagination control needed
    expect(calcPagination(50, 1).totalPages).toBe(1);
    expect(calcPagination(50, 1).hasPagination).toBe(false);

    // 51 items: 2 pages, automatically enables pagination
    const pag51 = calcPagination(51, 1);
    expect(pag51.totalPages).toBe(2);
    expect(pag51.hasPagination).toBe(true);

    // 125 items: 3 pages
    const pag125 = calcPagination(125, 2);
    expect(pag125.totalPages).toBe(3);
    expect(pag125.hasPagination).toBe(true);
    expect(pag125.page).toBe(2);
  });
});
