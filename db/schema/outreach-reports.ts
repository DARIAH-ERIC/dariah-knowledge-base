import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { outreachsTable } from "@/db/schema/outreachs";
import { reportsTable } from "@/db/schema/reports";

export const outreachReportsTable = pgTable("outreach_reports", {
	id,
	outreachId: uuid()
		.notNull()
		.references(
			() => {
				return outreachsTable.id;
			},
			{ onDelete: "cascade" },
		),
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

export const outreachReportRelations = relations(outreachReportsTable, ({ one }) => {
	return {
		outreach: one(outreachsTable, {
			fields: [outreachReportsTable.outreachId],
			references: [outreachsTable.id],
		}),
		report: one(reportsTable, {
			fields: [outreachReportsTable.reportId],
			references: [reportsTable.id],
		}),
	};
});

export type DbOutreachReport = typeof outreachReportsTable.$inferSelect;
export type DbOutreachReportInput = typeof outreachReportsTable.$inferInsert;
