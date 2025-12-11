import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/create-app";

export const index = createRouter()
  .openapi(createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Workout API Index",
      },
    },
  }), (c) => {
    return c.json({
      message: "Workout API",
    });
  });
