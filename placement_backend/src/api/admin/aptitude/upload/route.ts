import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parse } from "csv-parse/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface CategoryRouteConfig {
  slug: string;
  displayName: string;
  description: string;
  icon: string;
}

const CATEGORY_MAP: Record<string, CategoryRouteConfig> = {
  quantitative: {
    slug: "quantitative",
    displayName: "Quantitative Aptitude",
    description: "Arithmetic, algebra, time & work, permutations, probability, and numerical problem solving.",
    icon: "Calculator",
  },
  logical: {
    slug: "logical",
    displayName: "Logical Reasoning",
    description: "Puzzles, seating arrangements, syllogisms, blood relations, and analytical deductions.",
    icon: "Brain",
  },
  "data-interpretation": {
    slug: "data-interpretation",
    displayName: "Data Interpretation",
    description: "Charts, tables, bar graphs, pie charts, and data sufficiency analysis.",
    icon: "BarChart3",
  },
  verbal: {
    slug: "verbal",
    displayName: "Verbal Ability",
    description: "Reading comprehension, sentence correction, grammar, synonyms, and verbal logic.",
    icon: "BookOpen",
  },
};

/**
 * Route Category column to appropriate Aptitude DB Category
 */
function routeCategory(rawCategory: string): CategoryRouteConfig | null {
  if (!rawCategory) return null;
  const clean = rawCategory.trim().toLowerCase().replace(/[-_]/g, " ");

  // 1. Quantitative Aptitude
  if (
    clean === "quantitative aptitude" ||
    clean === "quantitative" ||
    clean.startsWith("quant") ||
    clean === "math" ||
    clean === "aptitude"
  ) {
    return CATEGORY_MAP["quantitative"];
  }

  // 2. Logical Reasoning
  if (
    clean === "logical reasoning" ||
    clean === "logical" ||
    clean.includes("reasoning") ||
    clean === "lr" ||
    clean === "logic"
  ) {
    return CATEGORY_MAP["logical"];
  }

  // 3. Data Interpretation
  if (
    clean === "data interpretation" ||
    clean === "data-interpretation" ||
    clean === "di" ||
    clean === "data" ||
    clean.includes("interpretation")
  ) {
    return CATEGORY_MAP["data-interpretation"];
  }

  // 4. Verbal Ability
  if (
    clean === "verbal ability" ||
    clean === "verbal" ||
    clean === "va" ||
    clean === "english" ||
    clean.includes("verbal")
  ) {
    return CATEGORY_MAP["verbal"];
  }

  return null;
}

/**
 * Robust case-insensitive header lookup
 */
function getFieldValue(row: Record<string, any>, possibleKeys: string[]): string {
  // Direct match
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }

  // Fuzzy match ignoring spaces, underscores, slashes, and casing
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

/**
 * Normalize Correct Answer to 'A' | 'B' | 'C' | 'D'
 */
function normalizeCorrectAnswer(
  ans: string,
  optionA: string,
  optionB: string,
  optionC: string,
  optionD: string
): "A" | "B" | "C" | "D" | null {
  if (!ans) return null;
  const upper = ans.trim().toUpperCase();

  // Direct single letter
  if (["A", "B", "C", "D"].includes(upper)) {
    return upper as "A" | "B" | "C" | "D";
  }

  // Format: "Option A", "Option 1", "A)", "(A)", "[A]"
  const optionMatch = upper.match(/(?:OPTION\s*|OPT\s*|^)([ABCD1234])(?:\)|\.|\s|$)/i);
  if (optionMatch) {
    const letterOrNum = optionMatch[1].toUpperCase();
    if (letterOrNum === "1" || letterOrNum === "A") return "A";
    if (letterOrNum === "2" || letterOrNum === "B") return "B";
    if (letterOrNum === "3" || letterOrNum === "C") return "C";
    if (letterOrNum === "4" || letterOrNum === "D") return "D";
  }

  // Numbers 1-4
  if (upper === "1") return "A";
  if (upper === "2") return "B";
  if (upper === "3") return "C";
  if (upper === "4") return "D";

  // Check matching option text content
  const cleanAns = ans.trim().toLowerCase();
  if (optionA && cleanAns === optionA.trim().toLowerCase()) return "A";
  if (optionB && cleanAns === optionB.trim().toLowerCase()) return "B";
  if (optionC && cleanAns === optionC.trim().toLowerCase()) return "C";
  if (optionD && cleanAns === optionD.trim().toLowerCase()) return "D";

  return null;
}

/**
 * Normalize Difficulty to 'Easy' | 'Medium' | 'Hard'
 */
function normalizeDifficulty(diff: string): "Easy" | "Medium" | "Hard" {
  if (!diff) return "Medium";
  const lower = diff.trim().toLowerCase();
  if (lower === "easy" || lower === "beginner" || lower === "basic") return "Easy";
  if (lower === "hard" || lower === "difficult" || lower === "advanced") return "Hard";
  return "Medium";
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const template = searchParams.get("template");

    if (template === "true" || template === "csv") {
      const sampleCsv = `Category,Difficulty,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Solution/Explanation
Quantitative Aptitude,Easy,"If the ratio of two numbers is 3:4 and their sum is 84, what is the greater number?",36,48,42,56,B,"Let the numbers be 3x and 4x. 3x + 4x = 84 => 7x = 84 => x = 12. Greater number is 4 * 12 = 48."
Quantitative Aptitude,Medium,"A train 240 m long passes a platform 650 m long in 89 seconds. What is the speed of the train in m/s?",8 m/s,10 m/s,12 m/s,15 m/s,B,"Total distance = 240 + 650 = 890 m. Time = 89 s. Speed = 890 / 89 = 10 m/s."
Logical Reasoning,Easy,"Pointing to a photograph of a boy, Suresh said 'He is the son of the only son of my mother.' How is Suresh related to that boy?",Brother,Uncle,Cousin,Father,D,"Mother's only son is Suresh himself. So the boy is Suresh's son, making Suresh the Father."
Logical Reasoning,Medium,"Look at the series: 2, 1, (1/2), (1/4), ... What number should come next?",(1/3),(1/8),(2/8),(1/16),B,"This is an alternating division series with each number divided by 2. (1/4) / 2 = 1/8."
Data Interpretation,Medium,"In a survey of 400 college students, 65% chose Software Engineering, 20% chose Core Engineering, and the remainder chose Higher Studies. How many chose Higher Studies?",40,60,80,100,B,"Remainder percentage = 100 - (65 + 20) = 15%. Total count = 0.15 * 400 = 60 students."
Data Interpretation,Hard,"A company sales chart shows revenue grew from $120,000 in 2024 to $168,000 in 2025. What is the percentage increase in revenue?",35%,40%,45%,50%,B,"Percentage increase = ((168,000 - 120,000) / 120,000) * 100 = (48,000 / 120,000) * 100 = 40%."
Verbal Ability,Easy,"Select the antonym for the word 'AMBIGUOUS'.",Vague,Obscure,Clear,Hidden,C,"Ambiguous means open to more than one interpretation; unclear. Its direct antonym is Clear."
Verbal Ability,Medium,"Find the correctly punctuated sentence.",Whom did you speak to?,Who did you speak to?,To whom did you speak.,To who did you speak?,A,"'Whom' is the objective pronoun required following the preposition 'to'."
`;

      return new NextResponse(sampleCsv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="aptitude_practice_questions_template.csv"',
        },
      });
    }

    const counts = await prisma.aptitudeQuestion.groupBy({
      by: ["categorySlug"],
      _count: { id: true },
    });

    return NextResponse.json({
      counts,
      supportedCategories: Object.values(CATEGORY_MAP),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process GET request" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    let csvContent = "";
    let fileName = "questions.csv";

    // 2. Extract CSV string from either FormData or JSON body
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No CSV file uploaded. Please select a .csv file." },
          { status: 400 }
        );
      }
      fileName = file.name || "uploaded.csv";
      if (!fileName.toLowerCase().endsWith(".csv")) {
        return NextResponse.json(
          { error: "Invalid file format. Please upload a standard .csv file." },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      csvContent = Buffer.from(arrayBuffer).toString("utf-8");
    } else {
      const body = await req.json();
      csvContent = body.csvContent || "";
      fileName = body.fileName || "questions.csv";
    }

    if (!csvContent || csvContent.trim() === "") {
      return NextResponse.json(
        { error: "Uploaded CSV file is empty." },
        { status: 400 }
      );
    }

    // 3. Parse CSV content using standard library csv-parse
    let rawRecords: Record<string, any>[] = [];
    try {
      rawRecords = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        bom: true,
      });
    } catch (parseErr: any) {
      console.error("CSV Parse error:", parseErr);
      return NextResponse.json(
        {
          error: `CSV Parsing error: ${parseErr.message || "Failed to parse CSV format"}`,
        },
        { status: 400 }
      );
    }

    if (!rawRecords || rawRecords.length === 0) {
      return NextResponse.json(
        { error: "CSV does not contain any valid rows or headers." },
        { status: 400 }
      );
    }

    // 4. Ensure base categories exist in database
    for (const catKey of Object.keys(CATEGORY_MAP)) {
      const conf = CATEGORY_MAP[catKey];
      await prisma.aptitudeCategory.upsert({
        where: { slug: conf.slug },
        update: { name: conf.displayName },
        create: {
          slug: conf.slug,
          name: conf.displayName,
          description: conf.description,
          icon: conf.icon,
        },
      });
    }

    // 5. Auto-Sorting and Data Mapping
    const validQuestions: Array<{
      text: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: "A" | "B" | "C" | "D";
      explanation: string;
      categorySlug: string;
      difficulty: "Easy" | "Medium" | "Hard";
      isPublished: boolean;
      rowNumber: number;
      categoryDisplayName: string;
    }> = [];

    const rejectedRows: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < rawRecords.length; i++) {
      const row = rawRecords[i];
      const rowNum = i + 2; // Row 1 is header in CSV

      // Data Mapping for CSV columns:
      // Category, Difficulty, Question Text, Option A, Option B, Option C, Option D, Correct Answer, Solution/Explanation
      const rawCategory = getFieldValue(row, [
        "Category",
        "category",
        "Aptitude Category",
        "Section",
        "Topic",
      ]);
      const rawDifficulty = getFieldValue(row, ["Difficulty", "difficulty", "Level"]);
      const rawQuestionText = getFieldValue(row, [
        "Question Text",
        "QuestionText",
        "Question",
        "text",
        "Problem",
      ]);
      const optionA = getFieldValue(row, ["Option A", "OptionA", "Option 1", "A", "option_a"]);
      const optionB = getFieldValue(row, ["Option B", "OptionB", "Option 2", "B", "option_b"]);
      const optionC = getFieldValue(row, ["Option C", "OptionC", "Option 3", "C", "option_c"]);
      const optionD = getFieldValue(row, ["Option D", "OptionD", "Option 4", "D", "option_d"]);
      const rawCorrectAnswer = getFieldValue(row, [
        "Correct Answer",
        "CorrectAnswer",
        "Answer",
        "correct_answer",
        "Key",
      ]);
      const rawExplanation = getFieldValue(row, [
        "Solution/Explanation",
        "Solution / Explanation",
        "Solution",
        "Explanation",
        "solution",
        "explanation",
        "Rationale",
      ]);

      // Category validation & Auto-Sorting
      const matchedCategory = routeCategory(rawCategory);
      if (!matchedCategory) {
        rejectedRows.push({
          row: rowNum,
          reason: `Invalid or unrecognized Category: "${rawCategory || "Empty"}". Supported: "Quantitative Aptitude", "Logical Reasoning", "Data Interpretation", "Verbal Ability".`,
        });
        continue;
      }

      // Question Text validation
      if (!rawQuestionText || rawQuestionText.length < 5) {
        rejectedRows.push({
          row: rowNum,
          reason: "Question Text is required and must be at least 5 characters.",
        });
        continue;
      }

      // Options validation
      if (!optionA || !optionB || !optionC || !optionD) {
        rejectedRows.push({
          row: rowNum,
          reason: "All 4 options (Option A, Option B, Option C, Option D) must be provided.",
        });
        continue;
      }

      // Correct Answer validation
      const normalizedAnswer = normalizeCorrectAnswer(
        rawCorrectAnswer,
        optionA,
        optionB,
        optionC,
        optionD
      );
      if (!normalizedAnswer) {
        rejectedRows.push({
          row: rowNum,
          reason: `Invalid Correct Answer: "${rawCorrectAnswer}". Must be one of A, B, C, D.`,
        });
        continue;
      }

      // Difficulty mapping
      const difficulty = normalizeDifficulty(rawDifficulty);

      // Explanation fallback
      const explanation =
        rawExplanation && rawExplanation.trim().length >= 3
          ? rawExplanation.trim()
          : `Correct option is ${normalizedAnswer}.`;

      validQuestions.push({
        text: rawQuestionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: normalizedAnswer,
        explanation,
        categorySlug: matchedCategory.slug,
        difficulty,
        isPublished: true,
        rowNumber: rowNum,
        categoryDisplayName: matchedCategory.displayName,
      });
    }

    if (validQuestions.length === 0) {
      return NextResponse.json(
        {
          error: "No valid questions could be extracted from the CSV file.",
          rejectedRows,
        },
        { status: 400 }
      );
    }

    // 6. Save sorted questions into the database
    const categoryCounts: Record<string, number> = {
      "Quantitative Aptitude": 0,
      "Logical Reasoning": 0,
      "Data Interpretation": 0,
      "Verbal Ability": 0,
    };

    const categorySlugCounts: Record<string, number> = {
      quantitative: 0,
      logical: 0,
      "data-interpretation": 0,
      verbal: 0,
    };

    // 6. Save sorted questions into the database
    // Use bulk createMany to insert all valid questions efficiently without timeout or truncation
    try {
      await prisma.aptitudeQuestion.createMany({
        data: validQuestions.map((q) => ({
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          categorySlug: q.categorySlug,
          difficulty: q.difficulty,
          isPublished: q.isPublished,
        })),
        skipDuplicates: false,
      });
    } catch (batchErr) {
      // Fallback: batch in chunks of 50
      for (let i = 0; i < validQuestions.length; i += 50) {
        const chunk = validQuestions.slice(i, i + 50);
        await prisma.$transaction(
          chunk.map((q) =>
            prisma.aptitudeQuestion.create({
              data: {
                text: q.text,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                categorySlug: q.categorySlug,
                difficulty: q.difficulty,
                isPublished: q.isPublished,
              },
            })
          )
        );
      }
    }

    // Count additions per category
    for (const q of validQuestions) {
      categoryCounts[q.categoryDisplayName] = (categoryCounts[q.categoryDisplayName] || 0) + 1;
      categorySlugCounts[q.categorySlug] = (categorySlugCounts[q.categorySlug] || 0) + 1;
    }

    // 7. Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: "CSV_IMPORT_APTITUDE",
        targetResource: "QUIZ",
        details: JSON.stringify({
          fileName,
          totalProcessed: rawRecords.length,
          totalAdded: validQuestions.length,
          byCategory: categoryCounts,
          rejectedCount: rejectedRows.length,
        }),
      },
    });

    // 8. Construct specific per-category success messages
    // e.g. "Successfully added 40 questions to Quantitative Aptitude"
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

    const overallMessage = `Import completed: ${validQuestions.length} practice questions sorted and saved successfully across categories.`;

    return NextResponse.json({
      success: true,
      totalAdded: validQuestions.length,
      totalProcessed: rawRecords.length,
      byCategory: categoryCounts,
      byCategorySlug: categorySlugCounts,
      messages,
      message: overallMessage,
      rejectedRows,
      sampleQuestions: validQuestions.slice(0, 5).map((q) => ({
        category: q.categoryDisplayName,
        difficulty: q.difficulty,
        text: q.text,
        correctAnswer: q.correctAnswer,
      })),
    });
  } catch (error: any) {
    console.error("CSV Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process and sort CSV upload." },
      { status: 500 }
    );
  }
}
