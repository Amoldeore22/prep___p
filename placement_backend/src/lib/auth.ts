import { NextRequest, NextResponse } from "@/lib/http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "placement-prep-super-secret-jwt-key-32-chars-minimum-2026";
export const COOKIE_NAME = process.env.COOKIE_NAME || "ppp_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req: NextRequest): Promise<SessionPayload | null> {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return verifyToken(authHeader.substring(7));
    }
    return null;
  }
  return verifyToken(cookie.value);
}

export async function requireAuth(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 }), user: null };
  }
  return { error: null, user };
}

export async function requireAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 }), user: null };
  }
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
