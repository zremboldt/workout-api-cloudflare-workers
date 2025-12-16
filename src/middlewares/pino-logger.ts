import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "hono-pino";

import { pinoLogger as logger } from "hono-pino";
import pino from "pino";

import type { AppBindings } from "@/lib/types";

export function pinoLogger() {
  return ((c, next) => logger({
    pino: pino({
      level: c.env?.LOG_LEVEL, // Log level differs based on environment. See wrangler config.
    }),
    http: {
      reqId: () => crypto.randomUUID(), // Simply generating a unique id to attach to each request
    },
  })(c as unknown as Context<Env>, next)) satisfies MiddlewareHandler<AppBindings>;
}
