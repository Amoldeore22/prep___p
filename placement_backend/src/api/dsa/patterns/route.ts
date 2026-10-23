import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    const patterns = await prisma.dSAPattern.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { problems: true },
        },
      },
    });

    let userProgressMap: Record<string, { solved: number; attempted: number }> = {};

    if (session?.userId) {
      const userProgress = await prisma.problemProgress.findMany({
        where: { userId: session.userId },
        include: {
          problem: {
            select: { patternId: true },
          },
        },
      });

      for (const prog of userProgress) {
        const patId = prog.problem.patternId;
        if (!userProgressMap[patId]) {
          userProgressMap[patId] = { solved: 0, attempted: 0 };
        }
        if (prog.status === "SOLVED") {
          userProgressMap[patId].solved++;
        } else if (prog.status === "ATTEMPTED") {
          userProgressMap[patId].attempted++;
        }
      }
    }

    const result = patterns.map((p) => {
      const prog = userProgressMap[p.id] || { solved: 0, attempted: 0 };
      const total = p._count.problems;
      const percent = total > 0 ? Math.round((prog.solved / total) * 100) : 0;

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        rawName: p.rawName,
        description: p.description,
        orderIndex: p.orderIndex,
        visualizerKey: p.visualizerKey,
        totalProblems: total,
        solvedCount: prog.solved,
        attemptedCount: prog.attempted,
        completionPercentage: percent,
      };
    });

    return NextResponse.json({ patterns: result });
  } catch (error) {
    console.error("Error fetching DSA patterns:", error);
    return NextResponse.json({ error: "Failed to fetch patterns" }, { status: 500 });
  }
}
