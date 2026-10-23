import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { z } from "zod";

const validSubjects = ["CPP", "OOPS", "DBMS", "SQL"] as const;

// Starter seed videos if subject has no videos yet
const starterVideos: Record<string, { topicName: string; videoUrl: string }[]> = {
  CPP: [
    {
      topicName: "C++ Fundamentals, Pointers & Memory Allocation",
      videoUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
    },
    {
      topicName: "C++ Standard Template Library (STL) Complete Masterclass",
      videoUrl: "https://www.youtube.com/watch?v=R5PEzP6W0-A",
    },
  ],
  OOPS: [
    {
      topicName: "Object-Oriented Programming (OOP) in One Video",
      videoUrl: "https://www.youtube.com/watch?v=wN0x9eZLix4",
    },
    {
      topicName: "Polymorphism, Virtual Functions & Abstract Classes",
      videoUrl: "https://www.youtube.com/watch?v=347f_3gQ60k",
    },
  ],
  DBMS: [
    {
      topicName: "Database Management System (DBMS) Full Course",
      videoUrl: "https://www.youtube.com/watch?v=kBdlM6hNDAE",
    },
    {
      topicName: "Database Normalization (1NF, 2NF, 3NF, BCNF) with Examples",
      videoUrl: "https://www.youtube.com/watch?v=GFQaEYEc8_8",
    },
  ],
  SQL: [
    {
      topicName: "SQL Tutorial - Full Database Course for Beginners",
      videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    },
    {
      topicName: "SQL Joins Visualized & Explained Step-by-Step",
      videoUrl: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw",
    },
  ],
};

const CreateVideoSchema = z.object({
  subject: z.string().transform((val) => val.toUpperCase().trim()),
  topicName: z.string().min(1, "Topic Name is required").max(200),
  videoUrl: z.string().min(1, "Video URL is required"),
});

// GET /api/prephub/videos?subject=CPP
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectParam = searchParams.get("subject")?.toUpperCase().trim();

    const where: any = {};
    if (subjectParam && validSubjects.includes(subjectParam as any)) {
      where.subject = subjectParam;
    }

    let videos = await prisma.prepHubVideo.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed starter videos for the subject if table is empty for that subject
    if (videos.length === 0 && subjectParam && starterVideos[subjectParam]) {
      try {
        await prisma.prepHubVideo.createMany({
          data: starterVideos[subjectParam].map((sv) => ({
            subject: subjectParam as any,
            topicName: sv.topicName,
            videoUrl: sv.videoUrl,
          })),
        });
        videos = await prisma.prepHubVideo.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });
      } catch (seedErr) {
        console.warn("Could not auto-seed starter videos:", seedErr);
      }
    }

    const formatted = videos.map((v) => ({
      ...v,
      "Topic Name": v.topicName,
      "Video_URL": v.videoUrl,
    }));

    return NextResponse.json({ videos: formatted });
  } catch (error) {
    console.error("PrepHub videos GET error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

// POST /api/prephub/videos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const subjectRaw = body.subject || body.Subject;
    const topicRaw = body.topicName || body.topic_name || body["Topic Name"] || body.topic || body.title;
    const videoUrlRaw = body.videoUrl || body.video_url || body["Video Link"] || body.videoLink || body["Video_URL"] || body.url;

    const parsed = CreateVideoSchema.safeParse({
      subject: subjectRaw,
      topicName: topicRaw,
      videoUrl: videoUrlRaw,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { subject, topicName, videoUrl } = parsed.data;

    if (!validSubjects.includes(subject as any)) {
      return NextResponse.json(
        { error: `Subject must be one of: ${validSubjects.join(", ")}` },
        { status: 400 }
      );
    }

    const newVideo = await prisma.prepHubVideo.create({
      data: {
        subject: subject as any,
        topicName: topicName.trim(),
        videoUrl: videoUrl.trim(),
      },
    });

    return NextResponse.json(
      {
        video: {
          ...newVideo,
          "Topic Name": newVideo.topicName,
          "Video_URL": newVideo.videoUrl,
        },
        message: "Video added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PrepHub video POST error:", error);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

// DELETE /api/prephub/videos?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    await prisma.prepHubVideo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("PrepHub video DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
