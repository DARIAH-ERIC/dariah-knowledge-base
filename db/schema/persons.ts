import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { contributionsTable } from "@/db/schema/contributions";
import { institutionsTable } from "@/db/schema/institutions";

export const personsTable = pgTable("persons", {
	id,
	name: text().notNull(),
	email: text(),
	orcid: text(),
	...timestamps,
});

export const personsRelations = relations(personsTable, ({ many }) => {
	return {
		contributions: many(contributionsTable),
		institutions: many(institutionsTable),
	};
});

export type DbPerson = typeof personsTable.$inferSelect;
export type DbPersonInput = typeof personsTable.$inferInsert;
