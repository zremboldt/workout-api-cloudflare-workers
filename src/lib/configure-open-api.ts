import { Scalar } from "@scalar/hono-api-reference";

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

  app.get("/reference", Scalar({
    layout: "modern",
    defaultHttpClient: {
      targetKey: "js",
      clientKey: "fetch",
    },
    // @ts-expect-error - Scalar types seem to be outdated, 'spec' works at runtime
    spec: {
      url: "/doc",
    },
  }));
}
