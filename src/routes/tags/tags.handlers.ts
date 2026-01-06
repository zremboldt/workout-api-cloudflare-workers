import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import * as schema from "@/db";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./tags.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const tags = await db.query.tags.findMany({
    with: {
      exercisesTags: {
        with: {
          exercise: true,
        },
      },
    },
  });

  // Transform the data to have an exercises array instead of exercisesTags
  const tagsWithExercises = tags.map(tag => ({
    ...tag,
    exercises: tag.exercisesTags.map(et => et.exercise),
    exercisesTags: undefined,
  }));

  return c.json(tagsWithExercises);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const tag = c.req.valid("json");

  // TODO: After auth is set up,
  // we'll set the userId here from our auth context. Something like:
  // const userId = c.get('userId'); // from auth middleware

  // For now, we'll just hardcode a userId for testing purposes.
  const userId = 1;

  const [inserted] = await db.insert(schema.tags).values({ ...tag, userId }).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });
  const tag = await db.query.tags.findFirst({
    where: (fields, operators) => {
      return operators.eq(fields.id, id); // Find tag where id field matches the id param
    },
    with: {
      exercisesTags: {
        with: {
          exercise: true,
        },
      },
    },
  });

  if (!tag) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  // Transform the data to have an exercises array instead of exercisesTags
  const tagWithExercises = {
    ...tag,
    exercises: tag.exercisesTags.map(et => et.exercise),
    exercisesTags: undefined,
  };

  return c.json(tagWithExercises, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const db = drizzle(c.env.DB, { schema });
  const [tag] = await db.update(schema.tags)
    .set(updates)
    .where(eq(schema.tags.id, id))
    .returning();

  if (!tag) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(tag, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });
  const result = await db.delete(schema.tags)
    .where(eq(schema.tags.id, id));

  if (result.meta.changes === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
