import { drizzle } from "drizzle-orm/d1";

import type { AppRouteHandler } from "@/lib/types";

import * as schema from "@/db";

import type { ListRoute } from "./users.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const users = await db.query.users.findMany();
  return c.json(users);
};
