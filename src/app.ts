import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

import type { AppBindings } from "@/lib/types";

import { pinoLogger } from "@/middlewares/pino-logger";

const app = new OpenAPIHono<AppBindings>({
  strict: false,
});

app.use(serveEmojiFavicon("💪"));
app.use(pinoLogger());

app.get("/", (c) => {
  // console.log(c.env.ENVIRONMENT);
  return c.text("Hello Hono!");
});

app.get("/users", async (c) => {
  const users = await c.env.DB.prepare("SELECT * FROM users;").all();
  return c.json(users.results);
});

app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .all();
  return c.json(user);
});

app.get("/error", (c) => {
  c.status(422);
  c.var.logger.info("Log here!");
  throw new Error("This is a test error");
});

app.notFound(notFound);
app.onError(onError);

export default app;
