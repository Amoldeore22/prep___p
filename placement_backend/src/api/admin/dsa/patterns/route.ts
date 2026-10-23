import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const PatternSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Pattern name is required"),
  rawName: z.string().optional(),
  description: z.string().optional(),
  orderIndex: z.number().int().optional(),
  isPublished: z.boolean().default(true),
  visualizerKey: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const patterns = await prisma.dSAPattern.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { problems: true },
        },
      },
    });

    return NextResponse.json({ patterns });
  } catch (error) {
    console.error("Admin patterns GET error:", error);
    return NextResponse.json({ error: "Failed to fetch patterns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = PatternSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { id, name, rawName, description, orderIndex, isPublished, visualizerKey } = parsed.data;

    let pattern;
    if (id) {
      pattern = await prisma.dSAPattern.update({
        where: { id },
        data: {
          name,
          rawName: rawName || name,
          description,
          orderIndex: orderIndex !== undefined ? orderIndex : 0,
          isPublished,
          visualizerKey: visualizerKey || null,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "UPDATE_PATTERN",
          targetResource: "DSA",
          targetId: pattern.id,
          details: JSON.stringify({ name, isPublished }),
        },
      });
    } else {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      pattern = await prisma.dSAPattern.create({
        data: {
          slug,
          name,
          rawName: rawName || name,
          description,
          orderIndex: orderIndex !== undefined ? orderIndex : 0,
          isPublished,
          visualizerKey: visualizerKey || null,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "CREATE_PATTERN",
          targetResource: "DSA",
          targetId: pattern.id,
          details: JSON.stringify({ name, slug }),
        },
      });
    }

    return NextResponse.json({ success: true, pattern });
  } catch (error: any) {
    console.error("Admin pattern POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save pattern" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Pattern ID is required" }, { status: 400 });
    }

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
    console.error("Admin pattern DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete pattern" },
      { status: 500 }
    );
  }
}

