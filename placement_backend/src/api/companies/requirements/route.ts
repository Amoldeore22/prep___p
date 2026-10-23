import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const branch = searchParams.get("branch");
    const location = searchParams.get("location");
    const graduationYear = searchParams.get("year");

    const where: any = { isPublished: true };

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
        { requiredSkills: { contains: search, mode: "insensitive" } },
      ];
    }

    if (branch && branch !== "all") {
      where.eligibleBranch = { contains: branch, mode: "insensitive" };
    }

    if (location && location !== "all") {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (graduationYear && graduationYear !== "all") {
      where.graduationYear = parseInt(graduationYear, 10);
    }

    const requirements = await prisma.companyRequirement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true, slug: true, logoUrl: true, website: true },
        },
      },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Company requirements GET error:", error);
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}
