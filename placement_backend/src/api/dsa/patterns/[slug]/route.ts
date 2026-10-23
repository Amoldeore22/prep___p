import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getSessionUser(req);

    const pattern = await prisma.dSAPattern.findUnique({
      where: { slug },
      include: {
        problems: {
          where: { isArchived: false },
          orderBy: { orderIndex: "asc" },
          include: {
            resources: true,
          },
        },
      },
    });

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    let progressMap: Record<
      string,
      { status: string; bookmarked: boolean; personalNotes: string | null }
    > = {};

    if (session?.userId) {
      const progresses = await prisma.problemProgress.findMany({
        where: {
          userId: session.userId,
          problemId: { in: pattern.problems.map((p) => p.id) },
        },
      });

      for (const pr of progresses) {
        progressMap[pr.problemId] = {
          status: pr.status,
          bookmarked: pr.bookmarked,
          personalNotes: pr.personalNotes,
        };
      }
    }

    const problemsWithProgress = pattern.problems.map((prob) => {
      const userPr = progressMap[prob.id] || {
        status: "NOT_STARTED",
        bookmarked: false,
        personalNotes: null,
      };

      return {
        id: prob.id,
        title: prob.title,
        slug: prob.slug,
        leetcodeUrl: prob.leetcodeUrl,
        difficulty: prob.difficulty,
        subcategory: prob.subcategory,
        orderIndex: prob.orderIndex,
        notes: prob.notes,
        description: prob.description,
        resources: prob.resources,
        status: userPr.status,
        bookmarked: userPr.bookmarked,
        personalNotes: userPr.personalNotes,
      };
    });

    return NextResponse.json({
      pattern: {
        id: pattern.id,
        slug: pattern.slug,
        name: pattern.name,
        rawName: pattern.rawName,
        description: pattern.description,
        visualizerKey: pattern.visualizerKey,
        orderIndex: pattern.orderIndex,
        problems: problemsWithProgress,
      },
    });
  } catch (error) {
    console.error("Error fetching pattern details:", error);
    return NextResponse.json(
      { error: "Failed to fetch pattern details" },
      { status: 500 }
    );
  }
}
