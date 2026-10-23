import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const StatusSchema = z.object({
  status: z.enum(["NOT_STARTED", "ATTEMPTED", "SOLVED"]).optional(),
  bookmarked: z.boolean().optional(),
  personalNotes: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const problemId = params.id;
    const body = await req.json();
    const parsed = StatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const { status, bookmarked, personalNotes } = parsed.data;

    const solvedAt = status === "SOLVED" ? new Date() : undefined;

    const progress = await prisma.problemProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.userId,
          problemId,
        },
      },
      update: {
        ...(status ? { status } : {}),
        ...(bookmarked !== undefined ? { bookmarked } : {}),
        ...(personalNotes !== undefined ? { personalNotes } : {}),
        ...(status === "SOLVED" ? { solvedAt: new Date() } : {}),
      },
      create: {
        userId: user.userId,
        problemId,
        status: status || "NOT_STARTED",
        bookmarked: bookmarked || false,
        personalNotes: personalNotes || null,
        solvedAt,
      },
    });

    // Record activity event
    if (status === "SOLVED" || status === "ATTEMPTED") {
      await prisma.activityEvent.create({
        data: {
          userId: user.userId,
          type: status === "SOLVED" ? "DSA_SOLVE" : "DSA_ATTEMPT",
          metadata: JSON.stringify({
            problemId,
            problemTitle: problem.title,
            difficulty: problem.difficulty,
          }),
        },
      });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating problem status:", error);
    return NextResponse.json(
      { error: "Failed to update problem status" },
      { status: 500 }
    );
  }
}
