export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
}

const JWT_SECRET = process.env.JWT_SECRET || "placement-prep-super-secret-jwt-key-32-chars-minimum-2026";
export const COOKIE_NAME = process.env.COOKIE_NAME || "ppp_session";

export async function verifyEdgeToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature using Web Crypto (100% native in Edge Runtime & Node)
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const binSig = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(binSig.length);
    for (let i = 0; i < binSig.length; i++) {
      sigBytes[i] = binSig.charCodeAt(i);
    }

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
    if (!isValid) return null;

    // Parse payload
    const binStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(binStr);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
