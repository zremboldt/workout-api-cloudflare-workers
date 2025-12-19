import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { insertSetSchema, patchSetSchema, selectSetsSchema } from "./sets.schema";

const tags = ["Sets"];

export const list = createRoute({
  path: "/sets",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectSetsSchema),
      "A list of sets",
    ),
  },
});

export const create = createRoute({
  path: "/sets",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertSetSchema,
      "The set to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSetsSchema,
      "The created set",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSetSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/sets/{id}",
  method: "get",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSetsSchema,
      "The requested set",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Set not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/sets/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
    body: jsonContentRequired(
      patchSetSchema,
      "The updates to the set",
    ), // Here we validate that the body is what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSetsSchema,
      "The updated set",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Set not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchSetSchema),
        createErrorSchema(IdParamsSchema),
      ],
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/sets/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Set deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Set not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
