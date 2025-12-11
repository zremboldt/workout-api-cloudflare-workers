import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

import type { AppBindings } from "@/lib/types";

import { pinoLogger } from "@/middlewares/pino-logger";

export function createApp() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
  });

  app.use(serveEmojiFavicon("💪"));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
