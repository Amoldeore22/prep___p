import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const [
      totalStudents,
      activeStudentsCount,
      totalProblems,
      totalSolvedEvents,
      totalQuizzes,
      totalQuizAttempts,
      publishedCompanies,
      pendingInterviews,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({
        where: {
          role: "STUDENT",
          progress: { some: {} },
        },
      }),
      prisma.problem.count({ where: { isArchived: false } }),
      prisma.problemProgress.count({ where: { status: "SOLVED" } }),
      prisma.dailyQuiz.count(),
      prisma.dailyQuizAttempt.count({ where: { isOfficial: true } }),
      prisma.companyRequirement.count({ where: { isPublished: true } }),
      prisma.interviewExperience.count({ where: { status: "PENDING" } }),
      prisma.activityEvent.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, department: true } },
        },
      }),
    ]);

    // Average aptitude accuracy across all official attempts
    const avgAccuracyAgg = await prisma.dailyQuizAttempt.aggregate({
      where: { isOfficial: true },
      _avg: { accuracy: true, score: true },
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        activeStudents: activeStudentsCount,
        totalProblems,
        totalSolvedEvents,
        totalQuizzes,
        totalQuizAttempts,
        avgQuizAccuracy: Math.round((avgAccuracyAgg._avg.accuracy || 0) * 10) / 10,
        avgQuizScore: Math.round((avgAccuracyAgg._avg.score || 0) * 10) / 10,
        publishedCompanies,
        pendingInterviews,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to generate admin analytics" }, { status: 500 });
  }
}
