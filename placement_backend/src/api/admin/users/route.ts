import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        graduationYear: true,
        cgpa: true,
        createdAt: true,
        _count: {
          select: {
            progress: true,
            quizAttempts: true,
            notes: true,
            auditLogs: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user accounts" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json();
    const { targetUserId, newRole } = body;

    if (!targetUserId || !["STUDENT", "ADMIN"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role or user ID" }, { status: 400 });
    }

    if (targetUserId === user.userId && newRole !== "ADMIN") {
      return NextResponse.json({ error: "Cannot demote your own administrator account" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.userId,
        action: `CHANGE_USER_ROLE_TO_${newRole}`,
        targetResource: "USER",
        targetId: targetUserId,
        details: JSON.stringify({ targetEmail: updated.email, newRole }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Role update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update role" }, { status: 500 });
  }
}
