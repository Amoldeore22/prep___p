import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken, COOKIE_NAME } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get(COOKIE_NAME);
  const session = cookie?.value ? await verifyEdgeToken(cookie.value) : null;

  // Protect Admin Portal Routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN") {
      // Student attempting to access admin route
      const dashUrl = new URL("/dashboard", req.url);
      dashUrl.searchParams.set("error", "Access Denied: Admin privileges required");
      return NextResponse.redirect(dashUrl);
    }
  }

  // Protect Student Portal Routes
  const studentProtectedPrefixes = [
    "/gateway",
    "/dashboard",
    "/pipeline",
    "/companies",
    "/roles",
    "/eligibility",
    "/student",
    "/prephub",
    "/dsa",
    "/problems",
    "/aptitude",
    "/interviews",
    "/notes",
    "/progress",
    "/profile",
  ];

  const isStudentProtected = studentProtectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isStudentProtected) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is already logged in and navigates to /login or /register, redirect to their home
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const targetUrl = session.role === "ADMIN" ? "/admin" : "/gateway";
      return NextResponse.redirect(new URL(targetUrl, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/gateway/:path*",
    "/dashboard/:path*",
    "/pipeline/:path*",
    "/companies/:path*",
    "/roles/:path*",
    "/eligibility/:path*",
    "/student/:path*",
    "/prephub/:path*",
    "/dsa/:path*",
    "/problems/:path*",
    "/aptitude/:path*",
    "/interviews/:path*",
    "/notes/:path*",
    "/progress/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
