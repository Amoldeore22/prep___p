import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const NoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().default(""),
  category: z.enum(["DSA", "Aptitude", "Interview", "General"]).default("DSA"),
  tags: z.string().nullable().optional(),
  isPinned: z.boolean().default(false),
  problemId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";
    const isPinned = searchParams.get("isPinned");

    const where: any = { userId: user.userId };
    if (category && category !== "All") where.category = category;
    if (isPinned === "true") where.isPinned = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      include: {
        problem: { select: { id: true, title: true, difficulty: true } },
        company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = NoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const note = await prisma.note.create({
      data: {
        userId: user.userId,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || null,
        isPinned: data.isPinned,
        problemId: data.problemId || null,
        companyId: data.companyId || null,
      },
      include: {
        problem: { select: { id: true, title: true } },
        company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create note" },
      { status: 500 }
    );
  }
}
