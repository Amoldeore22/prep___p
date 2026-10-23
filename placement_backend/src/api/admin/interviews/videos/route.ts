import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const VideoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  jobRole: z.string().min(2, "Job role is required"),
  round: z.string().min(2, "Interview round is required"),
  topic: z.string().optional(),
  videoUrl: z.string().url("Valid video URL required"),
  videoType: z.enum(["EXTERNAL_URL", "UPLOADED_FILE"]).default("EXTERNAL_URL"),
  thumbnailUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const videos = await prisma.interviewVideo.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Admin videos GET error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = VideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let video;
    if (data.id) {
      video = await prisma.interviewVideo.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          companyName: data.companyName,
          jobRole: data.jobRole,
          round: data.round,
          topic: data.topic,
          videoUrl: data.videoUrl,
          videoType: data.videoType,
          thumbnailUrl: data.thumbnailUrl || null,
          isPublished: data.isPublished,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "UPDATE_INTERVIEW_VIDEO",
          targetResource: "VIDEO",
          targetId: video.id,
          details: JSON.stringify({ title: data.title, isPublished: data.isPublished }),
        },
      });
    } else {
      video = await prisma.interviewVideo.create({
        data: {
          title: data.title,
          description: data.description,
          companyName: data.companyName,
          jobRole: data.jobRole,
          round: data.round,
          topic: data.topic,
          videoUrl: data.videoUrl,
          videoType: data.videoType,
          thumbnailUrl: data.thumbnailUrl || null,
          isPublished: data.isPublished,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "CREATE_INTERVIEW_VIDEO",
          targetResource: "VIDEO",
          targetId: video.id,
          details: JSON.stringify({ title: data.title }),
        },
      });
    }

    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    console.error("Admin video POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to save video" }, { status: 500 });
  }
}
