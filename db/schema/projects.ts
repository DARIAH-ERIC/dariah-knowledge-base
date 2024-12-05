import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { reportsTable } from "@/db/schema/reports";

export const projectScopeEnum = pgEnum("project_scope", ["eu", "national", "regional"]);

export const projectsTable = pgTable("projects", {
	id,
	name: text().notNull(),
	amount: integer(),
	funders: text(),
	// FIXME: use endDate field
	projectMonths: integer(),
	scope: projectScopeEnum(),
	startDate: timestamp({ mode: "date", withTimezone: true }),
	// FIXME: amount vs. totalAmount?
	totalAmount: integer(),
	reportId: uuid()
		.notNull()
		.references(
			() => {
				return reportsTable.id;
			},
			{ onDelete: "cascade" },
		),
	...timestamps,
});

export const projectRelations = relations(projectsTable, () => {
	return {};
});

export type DbProject = typeof projectsTable.$inferSelect;
export type DbProjectInput = typeof projectsTable.$inferInsert;
