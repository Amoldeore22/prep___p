import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const UpdateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().optional(),
  category: z.enum(["DSA", "Aptitude", "Interview", "General"]).optional(),
  tags: z.string().nullable().optional(),
  isPinned: z.boolean().optional(),
  problemId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        problem: { select: { id: true, title: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== user.userId) {
      return NextResponse.json({ error: "Access denied. Private note." }, { status: 403 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Note GET error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const existing = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updated = await prisma.note.update({
      where: { id: params.id },
      data: parsed.data,
      include: {
        problem: { select: { id: true, title: true } },
        company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error: any) {
    console.error("Note PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const existing = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Note deleted" });
  } catch (error: any) {
    console.error("Note DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete note" }, { status: 500 });
  }
}
