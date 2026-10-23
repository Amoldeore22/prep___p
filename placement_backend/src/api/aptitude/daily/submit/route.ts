import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const SubmitSchema = z.object({
  dailyQuizId: z.string().min(1),
  timeTakenSeconds: z.number().int().min(0).default(0),
  answers: z.record(z.string(), z.string().nullable()), // { [questionId]: "A" | "B" | "C" | "D" | null }
  isOfficial: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = SubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid submission" },
        { status: 400 }
      );
    }

    const { dailyQuizId, timeTakenSeconds, answers, isOfficial } = parsed.data;

    // Fetch daily quiz and its assigned questions
    const dailyQuiz = await prisma.dailyQuiz.findUnique({
      where: { id: dailyQuizId },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!dailyQuiz) {
      return NextResponse.json({ error: "Daily quiz not found" }, { status: 404 });
    }

    // Check if official attempt already exists
    if (isOfficial) {
      const existingOfficial = await prisma.dailyQuizAttempt.findFirst({
        where: {
          dailyQuizId,
          userId: user.userId,
          isOfficial: true,
        },
      });

      if (existingOfficial) {
        return NextResponse.json(
          { error: "You have already submitted your official attempt for today's quiz." },
          { status: 400 }
        );
      }
    }

    // Server-side scoring calculation
    let correctCount = 0;
    const answerRecords: Array<{
      questionId: string;
      selectedOption: string | null;
      isCorrect: boolean;
      correctAnswer: string;
      explanation: string;
      categorySlug: string;
      questionText: string;
    }> = [];

    const categoryStats: Record<string, { total: number; correct: number }> = {};

    for (const quizQ of dailyQuiz.questions) {
      const q = quizQ.question;
      const selected = answers[q.id] || null;
      const isCorrect = selected === q.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      if (!categoryStats[q.categorySlug]) {
        categoryStats[q.categorySlug] = { total: 0, correct: 0 };
      }
      categoryStats[q.categorySlug].total++;
      if (isCorrect) {
        categoryStats[q.categorySlug].correct++;
      }

      answerRecords.push({
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        categorySlug: q.categorySlug,
        questionText: q.text,
      });
    }

    const totalQuestions = dailyQuiz.totalQuestions;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Lock the daily quiz if it was unlocked
    if (!dailyQuiz.isLocked) {
      await prisma.dailyQuiz.update({
        where: { id: dailyQuizId },
        data: { isLocked: true },
      });
    }

    // Persist attempt and individual answers in transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const att = await tx.dailyQuizAttempt.create({
        data: {
          dailyQuizId,
          userId: user.userId,
          score: correctCount,
          totalQuestions,
          accuracy,
          timeTakenSeconds,
          isOfficial,
        },
      });

      for (const ans of answerRecords) {
        await tx.dailyQuizAnswer.create({
          data: {
            attemptId: att.id,
            questionId: ans.questionId,
            selectedOption: ans.selectedOption,
            isCorrect: ans.isCorrect,
          },
        });
      }

      if (isOfficial) {
        await tx.activityEvent.create({
          data: {
            userId: user.userId,
            type: "QUIZ_SUBMIT",
            metadata: JSON.stringify({
              quizDate: dailyQuiz.quizDate,
              score: correctCount,
              totalQuestions,
              accuracy,
            }),
          },
        });
      }

      return att;
    });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        score: correctCount,
        totalQuestions,
        accuracy: Math.round(accuracy * 10) / 10,
        timeTakenSeconds,
        isOfficial,
        categoryStats,
        answers: answerRecords,
      },
    });
  } catch (error: any) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
