import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function getTodayDateString(): string {
  const timezone = process.env.APP_TIMEZONE || "Asia/Kolkata";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayDateString();

    const [publishedCount, categoryCounts, dailyQuiz] = await Promise.all([
      prisma.aptitudeQuestion.count({ where: { isPublished: true } }),
      prisma.aptitudeQuestion.groupBy({
        by: ["categorySlug"],
        where: { isPublished: true },
        _count: { id: true },
      }),
      prisma.dailyQuiz.findUnique({
        where: { quizDate: date },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                  categorySlug: true,
                  difficulty: true,
                  optionA: true,
                  optionB: true,
                  optionC: true,
                  optionD: true,
                  correctAnswer: true,
                  explanation: true,
                },
              },
            },
          },
          _count: {
            select: { attempts: true },
          },
        },
      }),
    ]);

    const attemptsCount = dailyQuiz?._count.attempts || 0;
    const isLocked = attemptsCount > 0;

    return NextResponse.json({
      date,
      isToday: date === getTodayDateString(),
      totalPublishedQuestions: publishedCount,
      categoryCounts: categoryCounts.map((c) => ({
        categorySlug: c.categorySlug,
        count: c._count.id,
      })),
      quiz: dailyQuiz
        ? {
            id: dailyQuiz.id,
            quizDate: dailyQuiz.quizDate,
            title: dailyQuiz.title,
            totalQuestions: dailyQuiz.totalQuestions,
            attemptsCount,
            isLocked,
            questions: dailyQuiz.questions.map((q) => ({
              orderIndex: q.orderIndex,
              id: q.question.id,
              text: q.question.text,
              categorySlug: q.question.categorySlug,
              difficulty: q.question.difficulty,
              optionA: q.question.optionA,
              optionB: q.question.optionB,
              optionC: q.question.optionC,
              optionD: q.question.optionD,
              correctAnswer: q.question.correctAnswer,
              explanation: q.question.explanation,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error("Admin daily quiz GET error:", error);
    return NextResponse.json({ error: "Failed to fetch daily quiz status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json().catch(() => ({}));
    const date = body.date || getTodayDateString();

    // Check if quiz already exists and has attempts
    const existingQuiz = await prisma.dailyQuiz.findUnique({
      where: { quizDate: date },
      include: {
        _count: { select: { attempts: true } },
      },
    });

    if (existingQuiz && existingQuiz._count.attempts > 0) {
      return NextResponse.json(
        {
          error: "QUIZ_LOCKED",
          message: `Cannot regenerate quiz for ${date} because ${existingQuiz._count.attempts} student attempt(s) have already been recorded. Quiz is locked.`,
        },
        { status: 400 }
      );
    }

    // Check if at least 10 published questions exist
    const publishedQuestions = await prisma.aptitudeQuestion.findMany({
      where: { isPublished: true },
    });

    if (publishedQuestions.length < 10) {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_QUESTIONS",
          message: `At least 10 published questions are required. Currently available: ${publishedQuestions.length}.`,
          available: publishedQuestions.length,
          required: 10,
        },
        { status: 400 }
      );
    }

    // Distribute across categories
    const categories = ["quantitative", "logical", "verbal", "data-interpretation"];
    const selectedIds: string[] = [];

    // Avoid recently used questions from other recent quizzes if possible
    const recentQuizzes = await prisma.dailyQuiz.findMany({
      where: { quizDate: { not: date } },
      take: 7,
      orderBy: { quizDate: "desc" },
      include: { questions: true },
    });
    const recentlyUsedIds = new Set(
      recentQuizzes.flatMap((q) => q.questions.map((item) => item.questionId))
    );

    // Pick 2-3 per category
    for (const cat of categories) {
      const catPool = publishedQuestions.filter((q) => q.categorySlug === cat);
      const fresh = catPool.filter((q) => !recentlyUsedIds.has(q.id));
      const pool = fresh.length >= 2 ? fresh : catPool;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());

      for (const q of shuffled) {
        if (!selectedIds.includes(q.id) && selectedIds.length < 10) {
          selectedIds.push(q.id);
          if (selectedIds.length >= 8 && selectedIds.length % 2 === 0) break;
        }
      }
    }

    // Fill remaining to reach exactly 10
    if (selectedIds.length < 10) {
      const remaining = publishedQuestions.filter((q) => !selectedIds.includes(q.id));
      const shuffledRem = [...remaining].sort(() => 0.5 - Math.random());
      for (const q of shuffledRem) {
        if (selectedIds.length < 10) {
          selectedIds.push(q.id);
        }
      }
    }

    if (selectedIds.length < 10) {
      return NextResponse.json(
        { error: "INSUFFICIENT_QUESTIONS", message: "Failed to assemble 10 unique questions." },
        { status: 400 }
      );
    }

    // If existing quiz with 0 attempts, delete its question assignments first
    if (existingQuiz) {
      await prisma.dailyQuizQuestion.deleteMany({
        where: { dailyQuizId: existingQuiz.id },
      });
      await prisma.dailyQuiz.delete({
        where: { id: existingQuiz.id },
      });
    }

    // Create fresh quiz
    const newQuiz = await prisma.dailyQuiz.create({
      data: {
        quizDate: date,
        title: `Daily Placement Aptitude Quiz - ${date}`,
        totalQuestions: 10,
        questions: {
          create: selectedIds.slice(0, 10).map((qId, idx) => ({
            questionId: qId,
            orderIndex: idx + 1,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            question: true,
          },
        },
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: existingQuiz ? "REGENERATE_DAILY_QUIZ" : "GENERATE_DAILY_QUIZ",
        targetResource: "DAILY_QUIZ",
        targetId: newQuiz.id,
        details: JSON.stringify({ date, totalQuestions: 10 }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Daily quiz for ${date} successfully generated with 10 questions.`,
      quiz: newQuiz,
    });
  } catch (error: any) {
    console.error("Admin daily quiz POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate daily quiz" }, { status: 500 });
  }
}
