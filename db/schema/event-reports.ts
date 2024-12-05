import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { reportsTable } from "@/db/schema/reports";

export const eventReportsTable = pgTable("event_reports", {
	id,
	dariahCommissionedEvent: text(),
	largeMeetings: integer(),
	mediumMeetings: integer(),
	reusableOutcomes: text(),
	smallMeetings: integer(),
	reportId: uuid()
		.notNull()
		.references(
			() => {
				return reportsTable.id;
			},
			{ onDelete: "cascade" },
		)
		.unique(),
	...timestamps,
});

export const eventReportRelations = relations(eventReportsTable, ({ one }) => {
	return {
		report: one(reportsTable, {
			fields: [eventReportsTable.reportId],
			references: [reportsTable.id],
		}),
	};
});

export type DbEventReport = typeof eventReportsTable.$inferSelect;
export type DbEventReportInput = typeof eventReportsTable.$inferInsert;
