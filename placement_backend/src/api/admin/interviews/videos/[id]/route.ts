import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    await prisma.interviewVideo.delete({
      where: { id: params.id },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: "DELETE_INTERVIEW_VIDEO",
        targetResource: "VIDEO",
        targetId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Video deleted" });
  } catch (error: any) {
    console.error("Delete video error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete video" }, { status: 500 });
  }
}
