import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { Logger } from "pino";

export interface AppBindings {
  Bindings: CloudflareBindings; // These types are based on the wrangler config and can be auto generated with a command. See readme for details.
  Variables: {
    logger: Logger;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
