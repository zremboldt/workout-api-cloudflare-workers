import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertUserSchema, selectUsersSchema } from "./users.schema";

const tags = ["Users"];

export const list = createRoute({
  path: "/users",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectUsersSchema),
      "A list of users",
    ),
  },
});

export const create = createRoute({
  path: "/users",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertUserSchema,
      "The user to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectUsersSchema,
      "The created user",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUserSchema),
      "The validation error(s)",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
