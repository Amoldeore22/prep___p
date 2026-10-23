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

    await prisma.companyRequirement.delete({
      where: { id: params.id },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: "DELETE_COMPANY_REQUIREMENT",
        targetResource: "COMPANY",
        targetId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Requirement deleted" });
  } catch (error: any) {
    console.error("Delete requirement error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
