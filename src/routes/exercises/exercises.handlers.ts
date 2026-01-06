import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import * as schema from "@/db";

import type { AddTagRoute, CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute, RemoveTagRoute } from "./exercises.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const exercises = await db.query.exercises.findMany({
    with: {
      exercisesTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  // Transform the data to have a tags array instead of exercisesTags
  const exercisesWithTags = exercises.map(exercise => ({
    ...exercise,
    tags: exercise.exercisesTags.map(et => et.tag),
    exercisesTags: undefined,
  }));

  return c.json(exercisesWithTags);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const exercise = c.req.valid("json");

  // TODO: After auth is set up,
  // we'll set the userId here from our auth context. Something like:
  // const userId = c.get('userId'); // from auth middleware

  // For now, we'll just hardcode a userId for testing purposes.
  const userId = 1;

  const [inserted] = await db.insert(schema.exercises).values({ ...exercise, userId }).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });
  const exercise = await db.query.exercises.findFirst({
    where: (fields, operators) => {
      return operators.eq(fields.id, id); // Find exercise where id field matches the id param
    },
    with: {
      exercisesTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!exercise) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  // Transform the data to have a tags array instead of exercisesTags
  const exerciseWithTags = {
    ...exercise,
    tags: exercise.exercisesTags.map(et => et.tag),
    exercisesTags: undefined,
  };

  return c.json(exerciseWithTags, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const db = drizzle(c.env.DB, { schema });
  const [exercise] = await db.update(schema.exercises)
    .set(updates)
    .where(eq(schema.exercises.id, id))
    .returning();

  if (!exercise) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(exercise, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });
  const result = await db.delete(schema.exercises)
    .where(eq(schema.exercises.id, id));

  if (result.meta.changes === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const addTag: AppRouteHandler<AddTagRoute> = async (c) => {
  const { id, tagId } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });

  // Check if exercise exists
  const exercise = await db.query.exercises.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
  });

  if (!exercise) {
    return c.json(
      { message: "Exercise not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  // Check if tag exists
  const tag = await db.query.tags.findFirst({
    where: (fields, operators) => operators.eq(fields.id, tagId),
  });

  if (!tag) {
    return c.json(
      { message: "Tag not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  // Check if association already exists
  const existingAssociation = await db.query.exercisesTags.findFirst({
    where: (fields, operators) =>
      and(
        operators.eq(fields.exerciseId, id),
        operators.eq(fields.tagId, tagId),
      ),
  });

  if (existingAssociation) {
    return c.json(
      { message: "Tag already added to exercise" },
      HttpStatusCodes.CONFLICT,
    );
  }

  // Create the association
  await db.insert(schema.exercisesTags).values({
    exerciseId: id,
    tagId,
  });

  // Return the updated exercise with tags
  const updatedExercise = await db.query.exercises.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
    with: {
      exercisesTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!updatedExercise) {
    return c.json(
      { message: "Exercise not found after update" },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const exerciseWithTags = {
    ...updatedExercise,
    tags: updatedExercise.exercisesTags.map(et => et.tag),
    exercisesTags: undefined,
  };

  return c.json(exerciseWithTags, HttpStatusCodes.CREATED);
};

export const removeTag: AppRouteHandler<RemoveTagRoute> = async (c) => {
  const { id, tagId } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });

  // Delete the association
  const result = await db.delete(schema.exercisesTags)
    .where(
      and(
        eq(schema.exercisesTags.exerciseId, id),
        eq(schema.exercisesTags.tagId, tagId),
      ),
    );

  if (result.meta.changes === 0) {
    return c.json(
      { message: "Exercise, tag, or association not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
