import { NextRequest, NextResponse } from "@/lib/http";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const ForgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ForgotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const email = result.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal whether user exists
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we have generated a reset link.",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Clean up old tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: "Password reset instructions generated successfully.",
      resetUrl: `/reset-password?token=${token}`,
      note: "In production, this link is emailed. For development testing, you can click through to reset your password.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
