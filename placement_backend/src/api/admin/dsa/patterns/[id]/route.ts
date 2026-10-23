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
    const pattern = await prisma.dSAPattern.delete({
      where: { id },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: "DELETE_PATTERN",
        targetResource: "DSA",
        targetId: id,
        details: JSON.stringify({ name: pattern.name }),
      },
    });

    return NextResponse.json({ success: true, message: "Pattern deleted successfully" });
  } catch (error: any) {
    console.error("Admin delete pattern error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete pattern" },
      { status: 500 }
    );
  }
}
