import { drizzle } from "drizzle-orm/d1";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import * as schema from "@/db";

import type { CreateRoute, GetOneRoute, ListRoute } from "./users.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const users = await db.query.users.findMany();
  return c.json(users);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const user = c.req.valid("json");
  const [inserted] = await db.insert(schema.users).values(user).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const db = drizzle(c.env.DB, { schema });
  const user = await db.query.users.findFirst({
    where: (fields, operators) => {
      return operators.eq(fields.id, id); // Find user where id field matches the id param
    },
  });

  if (!user) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(user, HttpStatusCodes.OK);
};
