import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { contributionsTable } from "@/db/schema/contributions";

export const workingGroupsTable = pgTable("working_groups", {
	id,
	name: text().notNull(),
	startDate: timestamp({ mode: "date", withTimezone: true }),
	endDate: timestamp({ mode: "date", withTimezone: true }),
	...timestamps,
});

export const workingGroupsRelations = relations(workingGroupsTable, ({ many }) => {
	return {
		chairs: many(contributionsTable),
	};
});

export type DbWorkingGroup = typeof workingGroupsTable.$inferSelect;
export type DbWorkingGroupInput = typeof workingGroupsTable.$inferInsert;
