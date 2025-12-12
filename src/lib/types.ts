import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Logger } from "pino";

export interface AppBindings {
  Bindings: CloudflareBindings; // These types are based on the wrangler config and can be auto generated with a command. See readme for details.
  Variables: {
    logger: Logger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;
