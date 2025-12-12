import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";

import { createRouter } from "@/lib/create-app";

export const index = createRouter()
  .openapi(createRoute({
    method: "get",
    path: "/",
    responses: {
      200: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Workout API Index",
      ),
    },
  }), (c) => {
    return c.json({
      message: "Workout API",
    });
  });
