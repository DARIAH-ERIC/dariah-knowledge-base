import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { bytea } from "@/db/data-types";
import { id, timestamps } from "@/db/fields";
import { rolesTable } from "@/db/schema";
import { countriesTable } from "@/db/schema/countries";

export const userTypeEnum = pgEnum("user_type", ["admin", "user"]);

export const usersTable = pgTable(
	"users",
	{
		id,
		email: text().notNull().unique(),
		username: text().notNull(),
		// image: text(),
		passwordHash: text().notNull(),
		// TODO: emailVerified timestamp
		emailVerified: boolean().notNull().default(false),
		totpKey: bytea(),
		recoveryCode: bytea().notNull(),
		type: userTypeEnum().notNull().default("user"),

		countryId: uuid().references(
			() => {
				return countriesTable.id;
			},
			{ onDelete: "set null" },
		),
		roles: uuid()
			.references(() => {
				return rolesTable.id;
			})
			// FIXME:
			.array(),

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
