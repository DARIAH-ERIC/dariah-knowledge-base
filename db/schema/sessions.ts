import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usersTable } from "@/db/schema/users";

export const sessionsTable = pgTable("sessions", {
	id: text().primaryKey(),
	userId: uuid()
		.notNull()
		.references(
			() => {
				return usersTable.id;
			},
			{ onDelete: "cascade" },
		),
	expiresAt: timestamp({ mode: "date", withTimezone: true }).notNull(),
	twoFactorVerified: boolean().notNull().default(false),
});

export type DbSession = typeof sessionsTable.$inferSelect;
export type DbSessionInput = typeof sessionsTable.$inferInsert;
