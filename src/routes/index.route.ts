import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { createRouter } from "@/lib/create-app";

export const index = createRouter()
  .openapi(createRoute({
    tags: ["Index"], // tags are used to group endpoints together in the OpenAPI spec
    method: "get",
    path: "/",
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Workout API Index",
      ),
    },
  }), (c) => {
    return c.json({
      message: "Workout API",
    }, HttpStatusCodes.OK);
  });
