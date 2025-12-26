import type { MiddlewareHandler } from "hono";

import { cors } from "hono/cors";

import type { AppBindings } from "@/lib/types";

export function corsMiddleware(): MiddlewareHandler<AppBindings> {
  return cors({
    origin: ["https://zwrk.netlify.app"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });
}
