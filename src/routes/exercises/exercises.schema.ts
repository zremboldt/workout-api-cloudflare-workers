import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// TODO
// userId should be a foreign key that references users table. I want a user to have zero or many exercises.
// Do we need to set a default value for userId in this schema like we do with createdAt? Or do we set it manually on create?
// Should name be varchar with a length limit?
// description is optional. How will that playout down in the insertExerciseSchema validation?
// Should I omit description from insertExerciseSchema if it's optional?
// Should I omit userId from insertExerciseSchema and set it automatically?

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey(),
  userId: integer("userId"),
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
  name: schema => schema.min(1),
  description: schema => schema.min(1),
})
  .omit(
    {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  );

export const patchExerciseSchema = insertExerciseSchema.partial();
