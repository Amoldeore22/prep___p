import { NextRequest, NextResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const CompanyRequirementSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Valid website URL required").optional(),
  jobTitle: z.string().min(2, "Job title is required"),
  jobDescription: z.string().min(10, "Job description is required"),
  eligibleDegree: z.string().min(1, "Eligible degree is required"),
  eligibleBranch: z.string().min(1, "Eligible branch is required"),
  minCgpa: z.number().min(0).max(10).nullable().optional(),
  backlogRestrictions: z.string().nullable().optional(),
  requiredSkills: z.string().min(2, "Required skills are required"),
  graduationYear: z.number().int().min(2020).max(2035),
  location: z.string().min(2, "Location is required"),
  deadline: z.string().nullable().optional(),
  selectionRounds: z.string().nullable().optional(),
  salaryPackage: z.string().nullable().optional(),
  officialApplyUrl: z.string().url("Valid official application URL required"),
  sourceUrl: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const [requirements, companies] = await Promise.all([
      prisma.companyRequirement.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          company: true,
        },
      }),
      prisma.company.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ requirements, companies });
  } catch (error) {
    console.error("Admin companies GET error:", error);
    return NextResponse.json({ error: "Failed to fetch company data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAdmin(req);
    if (error || !user) return error;

    const body = await req.json();
    const parsed = CompanyRequirementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Find or create Company record
    const companySlug = data.companyName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const company = await prisma.company.upsert({
      where: { slug: companySlug },
      update: {
        website: data.website || undefined,
      },
      create: {
        name: data.companyName,
        slug: companySlug,
        website: data.website || null,
      },
    });

    let requirement;
    if (data.id) {
      requirement = await prisma.companyRequirement.update({
        where: { id: data.id },
        data: {
          companyId: company.id,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          jobDescription: data.jobDescription,
          eligibleDegree: data.eligibleDegree,
          eligibleBranch: data.eligibleBranch,
          minCgpa: data.minCgpa,
          backlogRestrictions: data.backlogRestrictions || null,
          requiredSkills: data.requiredSkills,
          graduationYear: data.graduationYear,
          location: data.location,
          deadline: data.deadline ? new Date(data.deadline) : null,
          selectionRounds: data.selectionRounds || null,
          salaryPackage: data.salaryPackage || null,
          officialApplyUrl: data.officialApplyUrl,
          sourceUrl: data.sourceUrl || null,
          isPublished: data.isPublished,
          lastVerifiedDate: new Date(),
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "UPDATE_COMPANY_REQUIREMENT",
          targetResource: "COMPANY",
          targetId: requirement.id,
          details: JSON.stringify({ company: data.companyName, jobTitle: data.jobTitle }),
        },
      });
    } else {
      requirement = await prisma.companyRequirement.create({
        data: {
          companyId: company.id,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          jobDescription: data.jobDescription,
          eligibleDegree: data.eligibleDegree,
          eligibleBranch: data.eligibleBranch,
          minCgpa: data.minCgpa,
          backlogRestrictions: data.backlogRestrictions || null,
          requiredSkills: data.requiredSkills,
          graduationYear: data.graduationYear,
          location: data.location,
          deadline: data.deadline ? new Date(data.deadline) : null,
          selectionRounds: data.selectionRounds || null,
          salaryPackage: data.salaryPackage || null,
          officialApplyUrl: data.officialApplyUrl,
          sourceUrl: data.sourceUrl || null,
          isPublished: data.isPublished,
          lastVerifiedDate: new Date(),
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminId: user.userId,
          action: "CREATE_COMPANY_REQUIREMENT",
          targetResource: "COMPANY",
          targetId: requirement.id,
          details: JSON.stringify({ company: data.companyName, jobTitle: data.jobTitle }),
        },
      });
    }

    return NextResponse.json({ success: true, requirement });
  } catch (error: any) {
    console.error("Admin requirement POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to save requirement" }, { status: 500 });
  }
}
