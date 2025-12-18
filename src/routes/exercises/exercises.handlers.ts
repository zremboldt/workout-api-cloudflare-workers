import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import * as schema from "@/db";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./exercises.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const exercises = await db.query.exercises.findMany();
  return c.json(exercises);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const exercise = c.req.valid("json");
  const [inserted] = await db.insert(schema.exercises).values(exercise).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });
  const exercise = await db.query.exercises.findFirst({
    where: (fields, operators) => {
      return operators.eq(fields.id, id); // Find exercise where id field matches the id param
    },
  });

  if (!exercise) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(exercise, HttpStatusCodes.OK);
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
