import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  domain?: string;
  expires?: Date;
}

export interface SetCookieRecord {
  name: string;
  value: string;
  options?: CookieOptions;
}

export class NextResponse {
  _data: any;
  status: number;
  headers: Headers;
  _cookies: SetCookieRecord[] = [];

  constructor(body: any, init?: { status?: number; headers?: HeadersInit }) {
    this._data = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }

  static json(data: any, init?: { status?: number; headers?: HeadersInit }): NextResponse {
    const res = new NextResponse(data, init);
    res.headers.set("content-type", "application/json");
    return res;
  }

  static redirect(url: string | URL, status: number = 307): NextResponse {
    const res = new NextResponse(null, { status });
    res.headers.set("location", typeof url === "string" ? url : url.toString());
    return res;
  }

  get cookies() {
    return {
      set: (name: string, value: string, options?: CookieOptions) => {
        this._cookies.push({ name, value, options });
      },
      delete: (name: string) => {
        this._cookies.push({ name, value: "", options: { maxAge: 0 } });
      },
    };
  }
}

export interface NextRequest {
  url: string;
  nextUrl: URL;
  method: string;
  headers: Headers;
  cookies: {
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
  };
  json: () => Promise<any>;
  text: () => Promise<string>;
  formData: () => Promise<FormData>;
}

export function adaptRoute(handlers: {
  GET?: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<any>;
  POST?: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<any>;
  PUT?: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<any>;
  DELETE?: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<any>;
  PATCH?: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<any>;
}) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    const method = req.method.toUpperCase();
    const handler = (handlers as any)[method];
    if (!handler) {
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }

    try {
      const host = req.get("host") || "localhost";
      const proto = req.protocol || "http";
      const fullUrl = `${proto}://${host}${req.originalUrl}`;
      const nextUrl = new URL(fullUrl);

      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (v !== undefined) {
          if (Array.isArray(v)) v.forEach((val) => headers.append(k, val));
          else headers.set(k, v);
        }
      }

      const cookiesObj: Record<string, string> = { ...(req.cookies || {}) };

      const nextReq: NextRequest = {
        url: fullUrl,
        nextUrl,
        method,
        headers,
        cookies: {
          get: (name: string) =>
            cookiesObj[name] !== undefined ? { name, value: cookiesObj[name] } : undefined,
          getAll: () =>
            Object.entries(cookiesObj).map(([name, value]) => ({ name, value })),
        },
        json: async () => req.body,
        text: async () =>
          typeof req.body === "string" ? req.body : JSON.stringify(req.body),
        formData: async () => {
          const fd = new FormData();
          if (req.body && typeof req.body === "object") {
            for (const [k, v] of Object.entries(req.body)) {
              fd.append(k, String(v));
            }
          }
          if ((req as any).file) {
            const f = (req as any).file;
            const file = new File([f.buffer], f.originalname, { type: f.mimetype });
            fd.append(f.fieldname, file);
          }
          if ((req as any).files) {
            const files = Array.isArray((req as any).files)
              ? (req as any).files
              : Object.values((req as any).files).flat();
            for (const f of files) {
              const file = new File([f.buffer], f.originalname, { type: f.mimetype });
              fd.append(f.fieldname, file);
            }
          }
          return fd;
        },
      };

      const ctx = { params: (req.params || {}) as Record<string, string> };
      const result = await handler(nextReq, ctx);

      if (!result) {
        return res.status(200).end();
      }

      const status = result.status || 200;

      // Transfer headers
      if (result.headers && typeof result.headers.forEach === "function") {
        result.headers.forEach((val: string, key: string) => {
          if (key.toLowerCase() !== "set-cookie") {
            res.setHeader(key, val);
          }
        });
      }

      // Transfer cookies
      if (result._cookies && Array.isArray(result._cookies)) {
        for (const c of result._cookies) {
          const opts: any = { ...(c.options || {}) };
          if (opts.maxAge !== undefined) {
            // Next.js cookie maxAge is in seconds, Express cookie maxAge is in milliseconds
            opts.maxAge = opts.maxAge * 1000;
          }
          res.cookie(c.name, c.value, opts);
        }
      }

      // Check if redirect
      if (status >= 300 && status < 400 && res.getHeader("location")) {
        return res.redirect(status, String(res.getHeader("location")));
      }

      // Body output
      if (result._data !== undefined) {
        return res.status(status).json(result._data);
      }

      return res.status(status).end();
    } catch (err: any) {
      console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err?.message || "An unexpected error occurred",
      });
    }
  };
}
