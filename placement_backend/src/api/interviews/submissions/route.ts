import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const SubmissionSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  jobRole: z.string().min(2, "Job role is required"),
  roundsSummary: z.string().min(10, "Rounds summary must be detailed"),
  questionsAsked: z.string().min(10, "Please list the questions asked"),
  preparationStrategy: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const mySubmissions = await prisma.interviewExperience.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions: mySubmissions });
  } catch (error) {
    console.error("Submissions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = SubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const submission = await prisma.interviewExperience.create({
      data: {
        userId: user.userId,
        companyName: data.companyName,
        jobRole: data.jobRole,
        roundsSummary: data.roundsSummary,
        questionsAsked: data.questionsAsked,
        preparationStrategy: data.preparationStrategy || null,
        difficulty: data.difficulty,
        status: "PENDING", // Strictly starts in moderation queue
      },
    });

    return NextResponse.json({
      success: true,
      message: "Experience submitted for moderation. It will be published after review.",
      submission,
    });
  } catch (error: any) {
    console.error("Submission POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit experience" },
      { status: 500 }
    );
  }
}
