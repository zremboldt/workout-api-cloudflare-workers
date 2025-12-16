import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook, // Formats Zod validation errors into structured error responses to client
  });
}

export function createApp() {
  const app = createRouter();

  app.use(serveEmojiFavicon("💪"));
  app.use(pinoLogger()); // Setting up pino middleware for logging

  app.notFound(notFound); // Setting up a 404 handler
  app.onError(onError); // Setting up a last resort error handler

  return app;
}

export function createTestApp(router: AppOpenAPI) {
  return createApp().route("/", router);
}
