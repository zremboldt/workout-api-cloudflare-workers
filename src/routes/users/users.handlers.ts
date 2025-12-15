import { drizzle } from "drizzle-orm/d1";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import * as schema from "@/db";

import type { CreateRoute, ListRoute } from "./users.routes";

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
