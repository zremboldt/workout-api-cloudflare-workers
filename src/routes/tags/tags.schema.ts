import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { exercisesTags } from "@/db/exercises-tags.schema";

import { users } from "../users/users.schema";

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade", // If a user is deleted, delete their tags too
    }),
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

// Define relations for Drizzle queries
export const tagsRelations = relations(tags, ({ many }) => ({
  exercisesTags: many(exercisesTags),
}));

// Auto-generate Zod schema from Drizzle schema
export const selectTagsSchema = createSelectSchema(tags);

export const insertTagSchema = createInsertSchema(tags, {
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
  ); // omit means that these fields will not be accepted by the API when creating a new tag because the server will handle setting them.

export const patchTagSchema = insertTagSchema.partial();
