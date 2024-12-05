import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { countriesTable } from "@/db/schema/countries";
import { personsTable } from "@/db/schema/persons";
import { rolesTable } from "@/db/schema/roles";
import { workingGroupsTable } from "@/db/schema/working-groups";

export const contributionsTable = pgTable("contributions", {
	id,
	countryId: uuid().references(() => {
		return countriesTable.id;
	}),
	personId: uuid().references(() => {
		return personsTable.id;
	}),
	roleId: uuid().references(() => {
		return rolesTable.id;
	}),
	workingGroupId: uuid().references(() => {
		return workingGroupsTable.id;
	}),
	startDate: timestamp({ mode: "date", withTimezone: true }),
	endDate: timestamp({ mode: "date", withTimezone: true }),
	...timestamps,
});

export const contributionRelations = relations(contributionsTable, ({ one }) => {
	return {
		country: one(countriesTable, {
			fields: [contributionsTable.countryId],
			references: [countriesTable.id],
		}),
		person: one(personsTable, {
			fields: [contributionsTable.personId],
			references: [personsTable.id],
		}),
		role: one(rolesTable, {
			fields: [contributionsTable.roleId],
			references: [rolesTable.id],
		}),
		workingGroup: one(workingGroupsTable, {
			fields: [contributionsTable.workingGroupId],
			references: [workingGroupsTable.id],
		}),
	};
});

export type DbContribution = typeof contributionsTable.$inferSelect;
export type DbContributionInput = typeof contributionsTable.$inferInsert;
