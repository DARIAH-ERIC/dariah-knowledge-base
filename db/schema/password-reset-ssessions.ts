import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usersTable } from "@/db/schema/users";

export const passwordResetSessionsTable = pgTable("password_reset_sessions", {
	id: text().primaryKey(),
	userId: uuid()
		.notNull()
		.references(
			() => {
				return usersTable.id;
			},
			{ onDelete: "cascade" },
		),
	email: text().notNull(),
	code: text().notNull(),
	expiresAt: timestamp({ mode: "date", withTimezone: true }).notNull(),
	emailVerified: boolean().notNull().default(false),
	twoFactorVerified: boolean().notNull().default(false),
});

export type DbPasswordResetSession = typeof passwordResetSessionsTable.$inferSelect;
export type DbPasswordResetSessionInput = typeof passwordResetSessionsTable.$inferInsert;
