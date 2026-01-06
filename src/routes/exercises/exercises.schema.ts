import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { tags } from "../tags/tags.schema";
import { users } from "../users/users.schema";

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade", // If a user is deleted, delete their exercises too
    }), // .references creates a foreign key to the users table
  tagId: integer("tagId")
    .references(() => tags.id, {
      onDelete: "set null", // If a tag is deleted, set tagId to null (exercises become untagged)
    }), // Optional foreign key to tags table
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

// Auto-generate Zod schema from Drizzle schema
export const selectExercisesSchema = createSelectSchema(exercises);

export const insertExerciseSchema = createInsertSchema(exercises, {
  tagId: schema => schema.optional(),
  name: schema => schema.min(1).max(255),
  description: schema => schema.max(1000).optional(),
})
  .omit(
    {
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  ); // omit means that these fields will not be accepted by the API when creating a new exercise because the server will handle setting them.

// TODO: Patch still seems to require name to be present, I want all fields to be optional on the patch route.
export const patchExerciseSchema = insertExerciseSchema.partial();
