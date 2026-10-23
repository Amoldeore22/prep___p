/**
 * API Routing & Client Utility for Standalone Placement Prep Backend
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Normalizes an API path to point to the standalone backend
 */
export function getApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // In development and production, route to the backend URL or proxied endpoint
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Universal fetch wrapper ensuring credentials (cookies) are sent to backend
 */
export async function apiFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string"
      ? input.startsWith("http")
        ? input
        : getApiUrl(input)
      : input.toString();

  return fetch(url, {
    ...init,
    credentials: "include", // Required for cross-origin JWT session cookies
  });
}

export default apiFetch;
