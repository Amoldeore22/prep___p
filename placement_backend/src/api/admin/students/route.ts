import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = { role: "STUDENT" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          graduationYear: true,
          cgpa: true,
          createdAt: true,
          _count: {
            select: {
              progress: true,
              quizAttempts: true,
              notes: true,
            },
          },
          progress: {
            where: { status: "SOLVED" },
            select: { id: true },
          },
        },
      }),
    ]);

    const formattedStudents = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      department: s.department || "Not specified",
      graduationYear: s.graduationYear,
      cgpa: s.cgpa,
      createdAt: s.createdAt,
      solvedCount: s.progress.length,
      attemptedCount: s._count.progress,
      quizCount: s._count.quizAttempts,
      notesCount: s._count.notes,
    }));

    return NextResponse.json({
      students: formattedStudents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin students GET error:", error);
    return NextResponse.json({ error: "Failed to fetch student list" }, { status: 500 });
  }
}
