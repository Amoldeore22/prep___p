import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const studentId = user.userId;

    // 1. Total Problems & Solved/Attempted counts
    const [totalProblems, allPatterns, studentProgress, quizAttempts] = await Promise.all([
      prisma.problem.count({ where: { isArchived: false } }),
      prisma.dSAPattern.findMany({
        where: { isPublished: true },
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { problems: true } },
        },
      }),
      prisma.problemProgress.findMany({
        where: { userId: studentId },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              patternId: true,
              leetcodeUrl: true,
            },
          },
        },
      }),
      prisma.dailyQuizAttempt.findMany({
        where: { userId: studentId, isOfficial: true },
        orderBy: { submittedAt: "desc" },
        take: 30,
        include: {
          dailyQuiz: { select: { quizDate: true, title: true } },
        },
      }),
    ]);

    let solvedCount = 0;
    let attemptedCount = 0;
    const difficultyStats = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
    };

    // Calculate difficulty total in DB
    const difficultyTotals = await prisma.problem.groupBy({
      by: ["difficulty"],
      where: { isArchived: false },
      _count: { id: true },
    });
    for (const d of difficultyTotals) {
      if (d.difficulty in difficultyStats) {
        difficultyStats[d.difficulty as keyof typeof difficultyStats].total = d._count.id;
      }
    }

    const patternStatsMap: Record<string, { solved: number; attempted: number }> = {};

    for (const pr of studentProgress) {
      if (pr.status === "SOLVED") {
        solvedCount++;
        const diff = pr.problem.difficulty as keyof typeof difficultyStats;
        if (difficultyStats[diff]) difficultyStats[diff].solved++;
      } else if (pr.status === "ATTEMPTED") {
        attemptedCount++;
      }

      const patId = pr.problem.patternId;
      if (!patternStatsMap[patId]) {
        patternStatsMap[patId] = { solved: 0, attempted: 0 };
      }
      if (pr.status === "SOLVED") patternStatsMap[patId].solved++;
      else if (pr.status === "ATTEMPTED") patternStatsMap[patId].attempted++;
    }

    const patternProgress = allPatterns.map((p) => {
      const stats = patternStatsMap[p.id] || { solved: 0, attempted: 0 };
      const total = p._count.problems;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        total,
        solved: stats.solved,
        attempted: stats.attempted,
        percent: total > 0 ? Math.round((stats.solved / total) * 100) : 0,
      };
    });

    const recentSolved = studentProgress
      .filter((pr) => pr.status === "SOLVED" && pr.solvedAt)
      .sort((a, b) => (b.solvedAt?.getTime() || 0) - (a.solvedAt?.getTime() || 0))
      .slice(0, 5)
      .map((pr) => ({
        id: pr.problem.id,
        title: pr.problem.title,
        difficulty: pr.problem.difficulty,
        leetcodeUrl: pr.problem.leetcodeUrl,
        solvedAt: pr.solvedAt,
      }));

    // Aptitude stats calculation
    const totalQuizzesTaken = quizAttempts.length;
    const avgScore =
      totalQuizzesTaken > 0
        ? Math.round(
            (quizAttempts.reduce((acc, q) => acc + q.score, 0) / totalQuizzesTaken) * 10
          ) / 10
        : 0;
    const avgAccuracy =
      totalQuizzesTaken > 0
        ? Math.round(
            (quizAttempts.reduce((acc, q) => acc + q.accuracy, 0) / totalQuizzesTaken) * 10
          ) / 10
        : 0;

    const quizScoreHistory = quizAttempts
      .map((q) => ({
        date: q.dailyQuiz.quizDate,
        score: q.score,
        accuracy: q.accuracy,
        timeTaken: q.timeTakenSeconds,
      }))
      .reverse();

    return NextResponse.json({
      dsa: {
        totalProblems,
        solvedCount,
        attemptedCount,
        overallCompletion:
          totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0,
        difficultyStats,
        patternProgress,
        recentSolved,
      },
      aptitude: {
        totalQuizzesTaken,
        avgScore,
        avgAccuracy,
        quizScoreHistory,
      },
    });
  } catch (error) {
    console.error("Student analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate student analytics" },
      { status: 500 }
    );
  }
}
