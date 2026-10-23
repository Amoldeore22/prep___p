import { NextRequest, NextResponse } from "@/lib/http";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

const RegisterSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address"),
    college: z.string().min(2, "College name must be at least 2 characters").optional(),
    branch: z.string().min(2, "Branch must be at least 2 characters").optional(),
    department: z.string().optional(),
    academicYear: z.string().optional(),
    graduationYear: z.number().int().optional(),
    cgpa: z.number().min(0).max(10).optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required").optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const {
      fullName,
      name,
      email,
      college,
      branch,
      department,
      academicYear,
      graduationYear,
      cgpa,
      password,
    } = result.data;

    const displayName = (fullName || name || "Student").trim();
    const normalizedEmail = email.toLowerCase().trim();
    const userBranch = (branch || department || "").trim();
    let userGradYear = graduationYear;
    if (!userGradYear && academicYear) {
      const parsedYear = parseInt(academicYear.replace(/\D/g, ""), 10);
      if (!isNaN(parsedYear) && parsedYear >= 2020 && parsedYear <= 2035) {
        userGradYear = parsedYear;
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: displayName,
        fullName: displayName,
        email: normalizedEmail,
        passwordHash,
        role: "STUDENT", // Role is strictly server-controlled
        college: college ? college.trim() : null,
        branch: userBranch || null,
        department: userBranch || null,
        academicYear: academicYear ? academicYear.trim() : null,
        graduationYear: userGradYear || null,
        cgpa: cgpa || null,
        studentProgress: {
          create: {
            questionsSolved: 0,
            aptitudeAttempts: 0,
            correctAnswers: 0,
            studyTime: 0,
            currentStreak: 0,
          },
        },
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        email: true,
        role: true,
        college: true,
        branch: true,
        department: true,
        academicYear: true,
        graduationYear: true,
        cgpa: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "STUDENT",
    });

    const res = NextResponse.json({
      message: "Registration successful",
      user,
      redirectTo: "/dashboard",
    });

    setSessionCookie(res, token);
    return res;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
