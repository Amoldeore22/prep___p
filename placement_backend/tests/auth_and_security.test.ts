import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";

describe("Authentication & Security Architecture", () => {
  it("Hashes passwords with bcrypt and verifies them accurately", async () => {
    const rawPassword = "StrongPassword@12345";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const wrongMatch = await verifyPassword("WrongPassword", hash);
    expect(wrongMatch).toBe(false);
  });

  it("Signs and verifies JWT tokens with server secret", () => {
    const payload = {
      userId: "usr_123456",
      email: "student@college.edu",
      role: "STUDENT" as const,
      name: "Test Student",
    };

    const token = signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe("STUDENT");
  });

  it("Rejects tampered tokens", () => {
    const token = signToken({
      userId: "usr_admin",
      email: "admin@placement.edu",
      role: "ADMIN" as const,
      name: "Admin User",
    });

    // Tamper the token payload
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;
    const decoded = verifyToken(tampered);
    expect(decoded).toBeNull();
  });
});
