import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { insertExerciseSchema, patchExerciseSchema, selectExercisesSchema } from "./exercises.schema";

const tags = ["Exercises"];

export const list = createRoute({
  path: "/exercises",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectExercisesSchema),
      "A list of exercises",
    ),
  },
});

export const create = createRoute({
  path: "/exercises",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertExerciseSchema,
      "The exercise to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectExercisesSchema,
      "The created exercise",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertExerciseSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/exercises/{id}",
  method: "get",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectExercisesSchema,
      "The requested exercise",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Exercise not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/exercises/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
    body: jsonContentRequired(
      patchExerciseSchema,
      "The updates to the exercise",
    ), // Here we validate that the body is what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectExercisesSchema,
      "The updated exercise",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Exercise not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchExerciseSchema),
        createErrorSchema(IdParamsSchema),
      ],
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/exercises/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema, // Here we validate that the params are what we expect
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Exercise deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Exercise not found",
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
