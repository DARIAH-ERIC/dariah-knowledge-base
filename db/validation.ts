import { createInsertSchema, createSelectSchema } from "drizzle-valibot";

import {
	appEventsTable,
	emailVerificationRequestsTable,
	passwordResetSessionsTable,
	sessionsTable,
	usersTable,
	webHooksTable,
	webHooksToAppEventsTable,
} from "@/db/schema";

export const DbAppEventSchema = createSelectSchema(appEventsTable);
export const DbAppEventInputSchema = createInsertSchema(appEventsTable);

export const DbEmailVerificationRequestSchema = createSelectSchema(emailVerificationRequestsTable);
export const DbEmailVerificationRequestInputSchema = createInsertSchema(
	emailVerificationRequestsTable,
);

export const DbPasswordResetSessionSchema = createSelectSchema(passwordResetSessionsTable);
export const DbPasswordResetSessionInputSchema = createInsertSchema(passwordResetSessionsTable);

export const DbSessionSchema = createSelectSchema(sessionsTable);
export const DbSessionInputSchema = createInsertSchema(sessionsTable);

export const DbUserSchema = createSelectSchema(usersTable);
export const DbUserInputSchema = createInsertSchema(usersTable);

export const DbWebHookSchema = createSelectSchema(webHooksTable);
export const DbWebHookInputSchema = createInsertSchema(webHooksTable);

export const DbWebHookToAppEventSchema = createSelectSchema(webHooksToAppEventsTable);
export const DbWebHookToAppEventInputSchema = createInsertSchema(webHooksToAppEventsTable);
