import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const difficulty = searchParams.get("difficulty");

    const where: any = { status: "APPROVED" };
    if (company && company !== "all") where.companyName = { contains: company, mode: "insensitive" };
    if (difficulty && difficulty !== "all") where.difficulty = difficulty;

    const experiences = await prisma.interviewExperience.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        user: { select: { name: true, department: true, graduationYear: true } },
      },
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Interview experiences GET error:", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}
