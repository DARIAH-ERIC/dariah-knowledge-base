import { boolean, index, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { bytea } from "@/db/data-types";
import { id, timestamps } from "@/db/fields";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const usersTable = pgTable(
	"users",
	{
		id,
		email: text().notNull().unique(),
		username: text().notNull(),
		passwordHash: text().notNull(),
		role: userRoleEnum().notNull().default("user"),
		// TODO: emailVerified timestamp
		emailVerified: boolean().notNull().default(false),
		totpKey: bytea(),
		recoveryCode: bytea().notNull(),
		...timestamps,
	},
	(table) => {
		return [index("email_index").on(table.email)];
	},
);

export type DbUser = typeof usersTable.$inferSelect;
export type DbUserInput = typeof usersTable.$inferInsert;
