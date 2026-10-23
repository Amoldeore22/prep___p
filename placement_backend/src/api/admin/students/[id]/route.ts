import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const studentId = params.id;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        graduationYear: true,
        cgpa: true,
        createdAt: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [progress, quizAttempts, recentEvents] = await Promise.all([
      prisma.problemProgress.findMany({
        where: { userId: studentId },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              leetcodeUrl: true,
              pattern: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.dailyQuizAttempt.findMany({
        where: { userId: studentId, isOfficial: true },
        orderBy: { submittedAt: "desc" },
        include: {
          dailyQuiz: { select: { quizDate: true, title: true } },
        },
      }),
      prisma.activityEvent.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
    ]);

    const solved = progress.filter((p) => p.status === "SOLVED");
    const attempted = progress.filter((p) => p.status === "ATTEMPTED");

    return NextResponse.json({
      student,
      stats: {
        totalSolved: solved.length,
        totalAttempted: attempted.length,
        totalQuizzes: quizAttempts.length,
        avgQuizScore:
          quizAttempts.length > 0
            ? Math.round(
                (quizAttempts.reduce((acc, q) => acc + q.score, 0) / quizAttempts.length) * 10
              ) / 10
            : 0,
      },
      solvedProblems: solved.map((s) => ({
        id: s.problem.id,
        title: s.problem.title,
        difficulty: s.problem.difficulty,
        patternName: s.problem.pattern.name,
        leetcodeUrl: s.problem.leetcodeUrl,
        solvedAt: s.solvedAt,
      })),
      quizHistory: quizAttempts.map((q) => ({
        date: q.dailyQuiz.quizDate,
        score: q.score,
        accuracy: q.accuracy,
        timeTaken: q.timeTakenSeconds,
        submittedAt: q.submittedAt,
      })),
      recentActivity: recentEvents,
    });
  } catch (error) {
    console.error("Admin student profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
  }
}
