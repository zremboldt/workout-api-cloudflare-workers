import { sql } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { exercises } from "../exercises/exercises.schema";

export const sets = sqliteTable("sets", {
  id: integer("id").primaryKey(),
  exerciseId: integer("exerciseId")
    .notNull()
    .references(() => exercises.id, {
      onDelete: "cascade", // If a exercise is deleted, delete their sets too
    }), // .references creates a foreign key to the exercises table
  weight: integer("weight"),
  reps: integer("reps").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

// Auto-generate Zod schema from Drizzle schema
export const selectSetsSchema = createSelectSchema(sets);

export const insertSetSchema = createInsertSchema(sets, {
  exerciseId: schema => schema.min(1),
  weight: schema => schema.min(1).optional(),
  reps: schema => schema.min(1),
})
  .omit(
    {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  ); // omit means that these fields will not be accepted by the API when creating a new set because the server will handle setting them.

export const patchSetSchema = insertSetSchema.partial();
