import { drizzle } from "drizzle-orm/d1";

import type { AppRouteHandler } from "@/lib/types";

import type { ListRoute } from "./users.routes";

import { users } from "./users.schema";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(users).all();
  return c.json(result);
};
