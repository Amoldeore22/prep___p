import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// Formats a date to YYYY-MM-DD in the configured timezone (Asia/Kolkata by default)
function getTodayDateString(): string {
  const timezone = process.env.APP_TIMEZONE || "Asia/Kolkata";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // "YYYY-MM-DD"
}

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const todayStr = getTodayDateString();

    // Check if daily quiz exists for today
    let dailyQuiz = await prisma.dailyQuiz.findUnique({
      where: { quizDate: todayStr },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            question: {
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
                // NEVER return correctAnswer or explanation before submission!
              },
            },
          },
        },
      },
    });

    // If no quiz exists for today, generate it atomically
    if (!dailyQuiz) {
      // 1. Check if at least 10 published questions exist
      const publishedCount = await prisma.aptitudeQuestion.count({
        where: { isPublished: true },
      });

      if (publishedCount < 10) {
        return NextResponse.json(
          {
            error: "INSUFFICIENT_QUESTIONS",
            message: `At least 10 published questions are required to generate today's quiz. Currently available: ${publishedCount}.`,
            available: publishedCount,
            required: 10,
          },
          { status: 400 }
        );
      }

      // 2. Select 10 unique questions distributed across categories
      // We pick questions from each of the 4 categories
      const categories = ["quantitative", "logical", "verbal", "data-interpretation"];
      const selectedQuestionIds: string[] = [];

      // Get questions not used in the last 7 days' daily quizzes if possible
      const recentQuizzes = await prisma.dailyQuiz.findMany({
        take: 7,
        orderBy: { quizDate: "desc" },
        include: { questions: true },
      });
      const recentlyUsedIds = new Set(
        recentQuizzes.flatMap((q) => q.questions.map((item) => item.questionId))
      );

      // Distribute: ~2-3 per category
      for (const cat of categories) {
        const catQuestions = await prisma.aptitudeQuestion.findMany({
          where: { categorySlug: cat, isPublished: true },
        });

        // Filter out recently used if we still have options
        const fresh = catQuestions.filter((q) => !recentlyUsedIds.has(q.id));
        const pool = fresh.length >= 2 ? fresh : catQuestions;

        // Shuffle
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        for (const q of shuffled) {
          if (!selectedQuestionIds.includes(q.id) && selectedQuestionIds.length < 10) {
            selectedQuestionIds.push(q.id);
            if (selectedQuestionIds.length % 2 === 0 && selectedQuestionIds.length >= 8) break;
          }
        }
      }

      // If still fewer than 10, fill from any remaining published questions
      if (selectedQuestionIds.length < 10) {
        const remaining = await prisma.aptitudeQuestion.findMany({
          where: {
            isPublished: true,
            id: { notIn: selectedQuestionIds },
          },
          take: 10 - selectedQuestionIds.length,
        });
        for (const q of remaining) {
          selectedQuestionIds.push(q.id);
        }
      }

      // Enforce EXACTLY 10 unique questions
      if (selectedQuestionIds.length < 10) {
        return NextResponse.json(
          {
            error: "INSUFFICIENT_QUESTIONS",
            message: "Unable to assemble 10 unique questions for today.",
          },
          { status: 400 }
        );
      }

      // Atomic quiz creation with unique constraint handling
      try {
        dailyQuiz = await prisma.dailyQuiz.create({
          data: {
            quizDate: todayStr,
            title: `Daily Placement Aptitude Quiz - ${todayStr}`,
            totalQuestions: 10,
            questions: {
              create: selectedQuestionIds.slice(0, 10).map((qId, idx) => ({
                questionId: qId,
                orderIndex: idx + 1,
              })),
            },
          },
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
              include: {
                question: {
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
                  },
                },
              },
            },
          },
        });
      } catch (e: any) {
        // In case of race condition from concurrent student requests, fetch the one that was created
        dailyQuiz = await prisma.dailyQuiz.findUnique({
          where: { quizDate: todayStr },
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
              include: {
                question: {
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
                  },
                },
              },
            },
          },
        });
      }
    }

    if (!dailyQuiz) {
      return NextResponse.json({ error: "Failed to initialize daily quiz" }, { status: 500 });
    }

    // Check if the current student has already completed today's official attempt
    const existingAttempt = await prisma.dailyQuizAttempt.findFirst({
      where: {
        dailyQuizId: dailyQuiz.id,
        userId: user.userId,
        isOfficial: true,
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                explanation: true,
                categorySlug: true,
              },
            },
          },
        },
      },
    });

    if (existingAttempt) {
      return NextResponse.json({
        quiz: {
          id: dailyQuiz.id,
          quizDate: dailyQuiz.quizDate,
          title: dailyQuiz.title,
          totalQuestions: dailyQuiz.totalQuestions,
        },
        hasCompleted: true,
        attempt: {
          id: existingAttempt.id,
          score: existingAttempt.score,
          totalQuestions: existingAttempt.totalQuestions,
          accuracy: existingAttempt.accuracy,
          timeTakenSeconds: existingAttempt.timeTakenSeconds,
          submittedAt: existingAttempt.submittedAt,
          answers: existingAttempt.answers.map((a) => ({
            questionId: a.questionId,
            questionText: a.question.text,
            optionA: a.question.optionA,
            optionB: a.question.optionB,
            optionC: a.question.optionC,
            optionD: a.question.optionD,
            selectedOption: a.selectedOption,
            correctAnswer: a.question.correctAnswer,
            isCorrect: a.isCorrect,
            explanation: a.question.explanation,
            categorySlug: a.question.categorySlug,
          })),
        },
      });
    }

    // Return the questions without answers or explanations
    return NextResponse.json({
      quiz: {
        id: dailyQuiz.id,
        quizDate: dailyQuiz.quizDate,
        title: dailyQuiz.title,
        totalQuestions: dailyQuiz.totalQuestions,
        questions: dailyQuiz.questions.map((q) => ({
          orderIndex: q.orderIndex,
          id: q.question.id,
          text: q.question.text,
          optionA: q.question.optionA,
          optionB: q.question.optionB,
          optionC: q.question.optionC,
          optionD: q.question.optionD,
          categorySlug: q.question.categorySlug,
          difficulty: q.question.difficulty,
          imageUrl: q.question.imageUrl,
        })),
      },
      hasCompleted: false,
      attempt: null,
    });
  } catch (error) {
    console.error("Daily quiz GET error:", error);
    return NextResponse.json({ error: "Failed to load daily quiz" }, { status: 500 });
  }
}
