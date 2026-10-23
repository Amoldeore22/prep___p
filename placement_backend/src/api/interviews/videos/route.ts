import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const round = searchParams.get("round");
    const topic = searchParams.get("topic");

    const where: any = { isPublished: true };
    if (company && company !== "all") where.companyName = { contains: company, mode: "insensitive" };
    if (round && round !== "all") where.round = round;
    if (topic && topic !== "all") where.topic = { contains: topic, mode: "insensitive" };

    const videos = await prisma.interviewVideo.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Videos GET error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
