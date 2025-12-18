import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

// Auto-generate Zod schema from Drizzle schema
export const selectUsersSchema = createSelectSchema(users);

export const insertUserSchema = createInsertSchema(users, {
  firstName: schema => schema.min(1),
  lastName: schema => schema.min(1),
  email: () => z.email(),
})
  .omit(
    {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  ); // omit means that these fields will not be accepted by the API when creating a new exercise because the server will handle setting them.

export const patchUserSchema = insertUserSchema.partial();
