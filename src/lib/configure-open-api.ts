import type { AppOpenAPI } from "@/lib/types";

import packageJSON from "../../package.json";

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      description: packageJSON.description,
      title: "Workout API",
    },
  });
}
