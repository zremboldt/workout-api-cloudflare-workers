import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { index } from "@/routes/index.route";
import { users } from "@/routes/users/users.index";

const app = createApp();

const routes = [
  index,
  users,
];

configureOpenAPI(app); // This sets up our documentation endpoints

routes.forEach((route) => {
  app.route("/", route);
});

export default app;
