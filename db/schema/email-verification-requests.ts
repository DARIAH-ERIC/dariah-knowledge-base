import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usersTable } from "@/db/schema/users";

export const emailVerificationRequestsTable = pgTable("email_verification_requests", {
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
});

export type DbEmailVerificationRequest = typeof emailVerificationRequestsTable.$inferSelect;
export type DbEmailVerificationRequestInput = typeof emailVerificationRequestsTable.$inferInsert;
