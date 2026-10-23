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

    const id = params.id;
    await prisma.aptitudeQuestion.delete({
      where: { id },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: "DELETE_APTITUDE_QUESTION",
        targetResource: "QUIZ",
        targetId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error: any) {
    console.error("Admin delete question error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
