import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { index } from "@/routes/index.route";
import { users } from "@/routes/users/users.index";

const app = createApp();

const routes = [
  index,
  users,
] as const; // Lets TypeScript know that this array is not going to change at runtime, which allows us to get the type out of it.

configureOpenAPI(app); // This sets up our documentation endpoints

routes.forEach((route) => {
  app.route("/", route);
});

// This will give us the type of everything at routes[i], which is the type of each route module.
// This is useful because in a monorepo scenario, we can use this on our client to get types for all routes.
export type AppType = typeof routes[number];

export default app;
