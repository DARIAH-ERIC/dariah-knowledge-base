import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { bodiesTable } from "@/db/schema/bodies";
import { contributionsTable } from "@/db/schema/contributions";

export const roleTypeEnum = pgEnum("role_type", [
	"dco_member",
	"director",
	"national_coordinator",
	"national_coordinator_deputy",
	"national_representative",
	"jrc_member",
	"scientific_board_member",
	"smt_member",
	"wg_chair",
	"wg_member",
]);

export const rolesTable = pgTable("roles", {
	id,
	name: text().notNull(),
	type: roleTypeEnum().notNull(),
	annualValue: integer().notNull(),
	...timestamps,
});

export const roleRelations = relations(rolesTable, ({ many }) => {
	return {
		bodies: many(bodiesTable),
		contributions: many(contributionsTable),
	};
});

export type DbRole = typeof rolesTable.$inferSelect;
export type DbRoleInput = typeof rolesTable.$inferInsert;
