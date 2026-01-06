import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { exercises } from "@/routes/exercises/exercises.schema";
import { tags } from "@/routes/tags/tags.schema";

export const exercisesTags = sqliteTable("exercises_tags", {
  id: integer("id").primaryKey(),
  exerciseId: integer("exerciseId")
    .notNull()
    .references(() => exercises.id, {
      onDelete: "cascade", // If an exercise is deleted, delete the join records
    }),
  tagId: integer("tagId")
    .notNull()
    .references(() => tags.id, {
      onDelete: "cascade", // If a tag is deleted, delete the join records
    }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Define relations for Drizzle queries
export const exercisesTagsRelations = relations(exercisesTags, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exercisesTags.exerciseId],
    references: [exercises.id],
  }),
  tag: one(tags, {
    fields: [exercisesTags.tagId],
    references: [tags.id],
  }),
}));

// Auto-generate Zod schema from Drizzle schema
export const selectExercisesTagsSchema = createSelectSchema(exercisesTags);

export const insertExercisesTagsSchema = createInsertSchema(exercisesTags)
  .omit({
    id: true,
    createdAt: true,
  });
