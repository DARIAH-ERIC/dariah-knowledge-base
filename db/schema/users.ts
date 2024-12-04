import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { bytea } from "@/db/data-types";
import { id, timestamps } from "@/db/fields";
import { countriesTable } from "@/db/schema/countries";

export const userRoleEnum = pgEnum("user_role", [
	"admin",
	"contributor",
	"national_coordinator",
	"working_group_chair",
]);

export const usersTable = pgTable(
	"users",
	{
		id,
		email: text().notNull().unique(),
		username: text().notNull(),
		passwordHash: text().notNull(),
		role: userRoleEnum().notNull().default("contributor"),
		// TODO: emailVerified timestamp
		emailVerified: boolean().notNull().default(false),
		totpKey: bytea(),
		recoveryCode: bytea().notNull(),
		countryId: uuid().references(
			() => {
				return countriesTable.id;
			},
			{ onDelete: "set null" },
		),
		// image: text(),
		...timestamps,
	},
	(table) => {
		return [index("email_index").on(table.email)];
	},
);

export const userRelations = relations(usersTable, ({ one }) => {
	return {
		country: one(countriesTable, {
			fields: [usersTable.countryId],
			references: [countriesTable.id],
		}),
	};
});

export type DbUser = typeof usersTable.$inferSelect;
export type DbUserInput = typeof usersTable.$inferInsert;
