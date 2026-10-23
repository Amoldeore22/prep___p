import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const ProblemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Problem title is required"),
  patternId: z.string().min(1, "Pattern assignment is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  leetcodeUrl: z.string().url("Valid URL required").nullable().optional(),
  subcategory: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isArchived: z.boolean().default(false),
  orderIndex: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const patternId = searchParams.get("patternId");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (patternId) where.patternId = patternId;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, problems] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ pattern: { orderIndex: "asc" } }, { orderIndex: "asc" }],
        include: {
          pattern: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      problems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin problems GET error:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = ProblemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { id, title, patternId, difficulty, leetcodeUrl, subcategory, notes, description, isArchived, orderIndex } = parsed.data;

    let problem;
    if (id) {
      problem = await prisma.problem.update({
        where: { id },
        data: {
          title,
          patternId,
          difficulty,
          leetcodeUrl: leetcodeUrl || null,
          subcategory: subcategory || null,
          notes: notes || null,
          ...(description !== undefined ? { description } : {}),
          isArchived,
          orderIndex: orderIndex !== undefined ? orderIndex : 0,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "UPDATE_PROBLEM",
          targetResource: "DSA",
          targetId: problem.id,
          details: JSON.stringify({ title, patternId, difficulty }),
        },
      });
    } else {
      const slug = `${title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}-${Date.now()}`;

      problem = await prisma.problem.create({
        data: {
          title,
          slug,
          patternId,
          difficulty,
          leetcodeUrl: leetcodeUrl || null,
          subcategory: subcategory || null,
          notes: notes || null,
          description: description || null,
          isArchived,
          orderIndex: orderIndex !== undefined ? orderIndex : 0,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "CREATE_PROBLEM",
          targetResource: "DSA",
          targetId: problem.id,
          details: JSON.stringify({ title, patternId }),
        },
      });
    }

    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    console.error("Admin problem POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save problem" },
      { status: 500 }
    );
  }
}
