import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const QuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(5, "Question text must be at least 5 characters"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"], {
    errorMap: () => ({ message: "Correct answer must be A, B, C, or D" }),
  }),
  explanation: z.string().min(5, "Explanation must be provided"),
  categorySlug: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  isPublished: z.boolean().default(true),
  imageUrl: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (categorySlug && categorySlug !== "all") where.categorySlug = categorySlug;
    if (difficulty && difficulty !== "all") where.difficulty = difficulty;
    if (search) {
      where.text = { contains: search, mode: "insensitive" };
    }

    const sort = searchParams.get("sort") || "asc";
    const orderBy: any =
      sort === "desc"
        ? [{ createdAt: "desc" }, { id: "desc" }]
        : [{ createdAt: "asc" }, { id: "asc" }];

    const [total, questions, categories, publishedCount] = await Promise.all([
      prisma.aptitudeQuestion.count({ where }),
      prisma.aptitudeQuestion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.aptitudeCategory.findMany(),
      prisma.aptitudeQuestion.count({ where: { isPublished: true } }),
    ]);

    return NextResponse.json({
      questions,
      categories,
      stats: {
        total,
        publishedCount,
        hasSufficientForDaily: publishedCount >= 10,
        missingForDaily: Math.max(0, 10 - publishedCount),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin questions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = QuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let question;
    if (data.id) {
      question = await prisma.aptitudeQuestion.update({
        where: { id: data.id },
        data: {
          text: data.text,
          optionA: data.optionA,
          optionB: data.optionB,
          optionC: data.optionC,
          optionD: data.optionD,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          categorySlug: data.categorySlug,
          difficulty: data.difficulty,
          isPublished: data.isPublished,
          imageUrl: data.imageUrl || null,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "UPDATE_APTITUDE_QUESTION",
          targetResource: "QUIZ",
          targetId: question.id,
          details: JSON.stringify({ category: data.categorySlug, difficulty: data.difficulty }),
        },
      });
    } else {
      question = await prisma.aptitudeQuestion.create({
        data: {
          text: data.text,
          optionA: data.optionA,
          optionB: data.optionB,
          optionC: data.optionC,
          optionD: data.optionD,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          categorySlug: data.categorySlug,
          difficulty: data.difficulty,
          isPublished: data.isPublished,
          imageUrl: data.imageUrl || null,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "CREATE_APTITUDE_QUESTION",
          targetResource: "QUIZ",
          targetId: question.id,
          details: JSON.stringify({ category: data.categorySlug, difficulty: data.difficulty }),
        },
      });
    }

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error("Admin question POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to save question" }, { status: 500 });
  }
}
