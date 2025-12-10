import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound } from "stoker/middlewares";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>({
  strict: false,
});

app.get("/", (c) => {
  console.log(c.env.MY_VAR);
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

app.notFound(notFound);

export default app;
