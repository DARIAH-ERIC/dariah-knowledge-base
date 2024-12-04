import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { rolesTable } from "@/db/schema/roles";

export const bodyTypeEnum = pgEnum("body_type", ["bod", "dco", "ga", "jrc", "ncc", "sb", "smt"]);

export const bodiesTable = pgTable("bodies", {
	id,
	name: text().notNull(),
	acronym: text(),
	type: bodyTypeEnum().notNull(),
	...timestamps,
});

export const bodiesRelations = relations(bodiesTable, ({ many }) => {
	return {
		roles: many(rolesTable),
	};
});

export type DbBody = typeof bodiesTable.$inferSelect;
export type DbBodyInput = typeof bodiesTable.$inferInsert;
