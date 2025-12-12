import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { index } from "@/routes/index.route";

const app = createApp();

const routes = [
  index,
];

configureOpenAPI(app); // This sets up our documentation endpoints

routes.forEach((route) => {
  app.route("/", route);
});

// app.get("/", (c) => {
//   // console.log(c.env.ENVIRONMENT);
//   return c.text("Hello Hono!");
// });

// app.get("/users", async (c) => {
//   const users = await c.env.DB.prepare("SELECT * FROM users;").all();
//   return c.json(users.results);
// });

// app.get("/users/:id", async (c) => {
//   const id = c.req.param("id");
//   const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
//     .bind(id)
//     .all();
//   return c.json(user);
// });

// app.get("/error", (c) => {
//   c.status(422);
//   c.var.logger.info("Log here!");
//   throw new Error("This is a test error");
// });

export default app;
