import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = { isPublished: true };
    if (categorySlug && categorySlug !== "all") {
      where.categorySlug = categorySlug;
    }
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    const [total, questions] = await Promise.all([
      prisma.aptitudeQuestion.count({ where }),
      prisma.aptitudeQuestion.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(limit, 100),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          categorySlug: true,
          difficulty: true,
          imageUrl: true,
          correctAnswer: true,
          explanation: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Aptitude practice error:", error);
    return NextResponse.json({ error: "Failed to fetch practice questions" }, { status: 500 });
  }
}
