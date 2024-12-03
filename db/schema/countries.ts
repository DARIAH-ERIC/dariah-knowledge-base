import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";
import { usersTable } from "@/db/schema";

export const countryTypeEnum = pgEnum("country_type", [
	"cooperating_partnership",
	"member_country",
	"other",
]);

export const countriesTable = pgTable(
	"countries",
	{
		id,
		code: text().notNull().unique(),
		name: text().notNull(),
		type: countryTypeEnum().notNull(),
		startDate: timestamp({ mode: "date", withTimezone: true }),
		endDate: timestamp({ mode: "date", withTimezone: true }),
		logo: text(),
		sshocMarketplaceId: integer(),
		...timestamps,
	},
	// (table) => {
	// 	return [index("code_index").on(table.code)];
	// },
);

export const countryRelations = relations(countriesTable, ({ many }) => {
	return {
		users: many(usersTable),
	};
});

export type DbCountry = typeof countriesTable.$inferSelect;
export type DbCountryInput = typeof countriesTable.$inferInsert;
