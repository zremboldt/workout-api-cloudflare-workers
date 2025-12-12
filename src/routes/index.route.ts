import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { createRouter } from "@/lib/create-app";

const tags = ["Index"];

export const index = createRouter()
  .openapi(createRoute({
    method: "get",
    path: "/",
    tags, // tags are used to group endpoints together in the OpenAPI spec
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
