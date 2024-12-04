import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { countriesTable } from "@/db/schema/countries";
import { personsTable } from "@/db/schema/persons";

export const institutionTypeEnum = pgEnum("institution_type", [
	"cooperating_partner",
	"national_coordinating_institution",
	"national_representative_institution",
	"other",
	"partner_institution",
]);

export const institutionsTable = pgTable("institutions", {
	id,
	name: text().notNull(),
	types: institutionTypeEnum().array(),
	startDate: timestamp({ mode: "date", withTimezone: true }),
	endDate: timestamp({ mode: "date", withTimezone: true }),
	/** Research Organization Registry. */
	ror: text(),
	url: text().array(),
	...timestamps,
});

export const institutionRelations = relations(institutionsTable, ({ many }) => {
	return {
		countries: many(countriesTable),
		persons: many(personsTable),
		// services: many(servicesTable),
	};
});

export type DbInstitution = typeof institutionsTable.$inferSelect;
export type DbInstitutionInput = typeof institutionsTable.$inferInsert;
