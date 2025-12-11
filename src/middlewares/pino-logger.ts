import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "hono-pino";

import { pinoLogger as logger } from "hono-pino";
import pino from "pino";

import type { AppBindings } from "@/lib/types";

export function pinoLogger() {
  return ((c, next) => logger({
    pino: pino({
      level: c.env.LOG_LEVEL,
    }),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  })(c as unknown as Context<Env>, next)) satisfies MiddlewareHandler<AppBindings>;
}
