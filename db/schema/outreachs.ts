import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { countriesTable } from "@/db/schema/countries";

export const outreachTypeEnum = pgEnum("outreach_type", ["national_website", "social_media"]);

export const outreachsTable = pgTable("outreachs", {
	id,
	name: text().notNull(),
	type: outreachTypeEnum().notNull(),
	url: text().notNull(),
	startDate: timestamp({ mode: "date", withTimezone: true }),
	endDate: timestamp({ mode: "date", withTimezone: true }),
	countryId: uuid()
		.notNull()
		.references(
			() => {
				return countriesTable.id;
			},
			{ onDelete: "cascade" },
		),
	...timestamps,
});

export const outreachRelations = relations(outreachsTable, ({ one }) => {
	return {
		country: one(countriesTable, {
			fields: [outreachsTable.countryId],
			references: [countriesTable.id],
		}),
	};
});

export type DbOutreach = typeof outreachsTable.$inferSelect;
export type DbOutreachInput = typeof outreachsTable.$inferInsert;
