import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Logger } from "pino";

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: {
    logger: Logger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;
