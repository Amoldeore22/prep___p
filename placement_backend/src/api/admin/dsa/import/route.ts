import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractDifficulty(title: string): "Easy" | "Medium" | "Hard" {
  const t = title.toLowerCase();
  if (t.includes("(easy)") || t.split(" ").includes("easy")) return "Easy";
  if (t.includes("(hard)") || t.split(" ").includes("hard")) return "Hard";
  return "Medium";
}

function parseWorkbookBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const patterns: any[] = [];
  let currentPattern: any = null;
  const validationWarnings: string[] = [];
  const validationErrors: string[] = [];
  const seenProblems = new Set<string>();

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] || [];
    const col0 = row[0] ? String(row[0]).trim() : "";
    const col1 = row[1] ? String(row[1]).trim() : "";
    const link1 = row[2] ? String(row[2]).trim() : "";
    const link2 = row[3] ? String(row[3]).trim() : "";
    const link3 = row[4] ? String(row[4]).trim() : "";

    if (r === 0 || (col0 === "Pattern" && col1 === "Question")) {
      continue;
    }

    const text = col1 || col0;
    const isPatternHeader =
      /^\d+\.\s*Pattern\s*:/i.test(text) ||
      /^Pattern\s*:/i.test(text) ||
      /^HEAP PATTERN/i.test(text) ||
      /^Recursion and Backtracking Pattern/i.test(text) ||
      /^Tree Pattern/i.test(text) ||
      /^GRAPHS/i.test(text) ||
      /^DP\s*\(Dynamic Programming\)/i.test(text);

    if (isPatternHeader) {
      const cleanName = text
        .replace(/^\d+\.\s*/, "")
        .replace(/^Pattern\s*:\s*/i, "")
        .trim();

      currentPattern = {
        name: cleanName,
        rawName: text,
        rowNumber: r + 1,
        questions: [],
      };
      patterns.push(currentPattern);
    } else if (currentPattern) {
      if (!col1 && !link1 && !col0) continue;

      let title = col1;
      const links = [link1, link2, link3].filter(
        (l) => l && l !== "undefined" && l.startsWith("http")
      );

      if (!title && links.length > 0) {
        const match = links[0].match(/problems\/([^/]+)/);
        if (match) {
          title = match[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        } else {
          title = `Problem at row ${r + 1}`;
        }
        validationWarnings.push(`Row ${r + 1}: Inferred title '${title}' from URL.`);
      }

      if (!title) {
        validationWarnings.push(`Row ${r + 1}: Skipped row with empty title and empty links.`);
        continue;
      }

      if (!links.length) {
        validationWarnings.push(`Row ${r + 1} ('${title}'): No primary LeetCode URL provided.`);
      }

      const diff = extractDifficulty(title);
      const probKey = title.toLowerCase();

      if (seenProblems.has(probKey)) {
        validationWarnings.push(`Row ${r + 1}: Duplicate problem title '${title}' detected.`);
      }
      seenProblems.add(probKey);

      currentPattern.questions.push({
        rowNumber: r + 1,
        title,
        subcategory: col0 && col0 !== "None" ? col0 : null,
        difficulty: diff,
        leetcodeUrl: links[0] || null,
        additionalUrls: links.slice(1),
        notes: [link1, link2, link3].some((l) => l && l.includes("Homework")) ? "Homework" : null,
      });
    }
  }

  return { patterns, validationWarnings, validationErrors };
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const { action } = await req.json();

    // Default to the actual workbook in project/data if no custom file uploaded
    const workbookPath = path.join(process.cwd(), "data", "DSA_patterns_Cheat_Sheet.xlsx");
    if (!fs.existsSync(workbookPath)) {
      return NextResponse.json(
        { error: "Workbook file not found on server at data/DSA_patterns_Cheat_Sheet.xlsx" },
        { status: 404 }
      );
    }

    const buffer = fs.readFileSync(workbookPath);
    const { patterns, validationWarnings, validationErrors } = parseWorkbookBuffer(buffer);

    const totalProblems = patterns.reduce((sum, p) => sum + p.questions.length, 0);

    if (action === "preview") {
      return NextResponse.json({
        action: "preview",
        summary: {
          totalPatterns: patterns.length,
          totalProblems,
          warningCount: validationWarnings.length,
          errorCount: validationErrors.length,
        },
        warnings: validationWarnings,
        errors: validationErrors,
        patterns: patterns.map((p) => ({
          name: p.name,
          rawName: p.rawName,
          rowNumber: p.rowNumber,
          problemCount: p.questions.length,
          sampleQuestions: p.questions.slice(0, 3),
        })),
      });
    }

    if (action === "commit") {
      const implementedVisualizers: Record<string, string> = {
        "two-pointers": "two-pointers",
        "fast-slow-pointers": "fast-slow-pointers",
        "sliding-window": "sliding-window",
        "kadane-pattern": "kadane-pattern",
        "binary-search": "binary-search",
        "merge-intervals": "merge-intervals",
        "stack": "stack",
        "in-place-reversal-of-a-linkedlist": "in-place-reversal-of-a-linkedlist",
      };

      let committedPatterns = 0;
      let committedProblems = 0;

      for (let i = 0; i < patterns.length; i++) {
        const p = patterns[i];
        const pSlug = slugify(p.name);
        const visualizerKey = implementedVisualizers[pSlug] || null;

        const patternRecord = await prisma.dSAPattern.upsert({
          where: { slug: pSlug },
          update: {
            name: p.name,
            rawName: p.rawName,
            orderIndex: i + 1,
            visualizerKey,
          },
          create: {
            slug: pSlug,
            name: p.name,
            rawName: p.rawName,
            description: `Master ${p.name} pattern through curated interview problems.`,
            orderIndex: i + 1,
            visualizerKey,
            isPublished: true,
          },
        });
        committedPatterns++;

        for (let j = 0; j < p.questions.length; j++) {
          const q = p.questions[j];
          const qSlug = slugify(`${pSlug}-${q.title}-${q.rowNumber}`);

          const problemRecord = await prisma.problem.upsert({
            where: { slug: qSlug },
            update: {
              title: q.title,
              leetcodeUrl: q.leetcodeUrl,
              difficulty: q.difficulty,
              subcategory: q.subcategory,
              notes: q.notes,
              orderIndex: j + 1,
              patternId: patternRecord.id,
            },
            create: {
              title: q.title,
              slug: qSlug,
              leetcodeUrl: q.leetcodeUrl,
              difficulty: q.difficulty,
              subcategory: q.subcategory,
              notes: q.notes,
              orderIndex: j + 1,
              patternId: patternRecord.id,
            },
          });
          committedProblems++;

          if (q.additionalUrls && q.additionalUrls.length > 0) {
            for (const url of q.additionalUrls) {
              const existingRes = await prisma.problemResource.findFirst({
                where: { problemId: problemRecord.id, url },
              });
              if (!existingRes) {
                await prisma.problemResource.create({
                  data: {
                    problemId: problemRecord.id,
                    title: url.includes("youtube") ? "Video Solution" : "Reference",
                    url,
                    type: url.includes("youtube") ? "video" : "article",
                  },
                });
              }
            }
          }
        }
      }

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "IMPORT_DSA_WORKBOOK",
          targetResource: "DSA",
          details: JSON.stringify({
            patternsCount: committedPatterns,
            problemsCount: committedProblems,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${committedPatterns} patterns and ${committedProblems} problems from Excel workbook.`,
        summary: {
          committedPatterns,
          committedProblems,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'preview' or 'commit'." }, { status: 400 });
  } catch (error: any) {
    console.error("DSA Import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
