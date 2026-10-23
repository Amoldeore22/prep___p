import { NextResponse } from "@/lib/http";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });
  clearSessionCookie(res);
  return res;
}
