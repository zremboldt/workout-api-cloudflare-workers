import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { insertTagSchema, patchTagSchema, selectTagsSchema } from "./tags.schema";

const tags = ["Tags"];

export const list = createRoute({
  path: "/tags",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectTagsSchema),
      "A list of tags",
    ),
  },
});

export const create = createRoute({
  path: "/tags",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertTagSchema,
      "The tag to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTagsSchema,
      "The created tag",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTagSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/tags/{id}",
  method: "get",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTagsSchema,
      "The requested tag",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Tag not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/tags/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
    body: jsonContentRequired(
      patchTagSchema,
      "The updates to the tag",
    ), // Here we validate that the body is what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTagsSchema,
      "The updated tag",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Tag not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchTagSchema),
        createErrorSchema(IdParamsSchema),
      ],
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/tags/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Tag deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Tag not found",
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
