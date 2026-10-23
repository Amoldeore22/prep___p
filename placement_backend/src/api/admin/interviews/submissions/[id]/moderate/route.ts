import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const ModerateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "NEEDS_REVISION"]),
  adminFeedback: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const id = params.id;
    const body = await req.json();
    const parsed = ModerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid status" },
        { status: 400 }
      );
    }

    const { status, adminFeedback } = parsed.data;

    const experience = await prisma.interviewExperience.update({
      where: { id },
      data: {
        status,
        adminFeedback: adminFeedback || null,
        publishedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: `MODERATE_INTERVIEW_${status}`,
        targetResource: "INTERVIEW",
        targetId: id,
        details: JSON.stringify({ status, adminFeedback }),
      },
    });

    return NextResponse.json({ success: true, experience });
  } catch (error: any) {
    console.error("Moderation error:", error);
    return NextResponse.json({ error: error.message || "Failed to moderate" }, { status: 500 });
  }
}
