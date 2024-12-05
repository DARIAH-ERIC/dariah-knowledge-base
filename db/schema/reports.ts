import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { countriesTable } from "@/db/schema/countries";

export const reportStatusEnum = pgEnum("report_status", ["draft", "final", "frozen"]);

export const reportsTable = pgTable("reports", {
	id,
	year: integer().notNull().unique(),
	countryId: uuid()
		.notNull()
		.references(
			() => {
				return countriesTable.id;
			},
			{ onDelete: "cascade" },
		),
	contributionsCount: integer(),
	operationalCost: integer(),
	operationalCostDetail: jsonb(),
	operationalCostThreshold: integer(),
	status: reportStatusEnum().notNull().default("draft"),
	comments: jsonb(),
	...timestamps,
});

export const reportRelations = relations(reportsTable, () => {
	return {};
});

export type DbReport = typeof reportsTable.$inferSelect;
export type DbReportInput = typeof reportsTable.$inferInsert;
