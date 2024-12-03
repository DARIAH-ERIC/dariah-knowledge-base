import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";

export const appEventsTable = pgTable("app-events", {
	id,
	name: text().notNull(),
	...timestamps,
});

export const appEventRelations = relations(appEventsTable, ({ many }) => {
	return {
		webHooks: many(webHooksToAppEventsTable),
	};
});

export type DbAppEvent = typeof appEventsTable.$inferSelect;
export type DbAppEventInput = typeof appEventsTable.$inferInsert;

export const webHooksTable = pgTable("web-hooks", {
	id,
	url: text().notNull().unique(),
	signKey: text().notNull(),
	...timestamps,
});

export const webHookRelations = relations(webHooksTable, ({ many }) => {
	return {
		appEvents: many(webHooksToAppEventsTable),
	};
});

export type DbWebHook = typeof webHooksTable.$inferSelect;
export type DbWebHookInput = typeof webHooksTable.$inferInsert;

export const webHooksToAppEventsTable = pgTable(
	"web-hooks_app-events",
	{
		appEventId: uuid()
			.notNull()
			.references(
				() => {
					return appEventsTable.id;
				},
				{ onDelete: "cascade" },
			),
		webHookId: uuid()
			.notNull()
			.references(
				() => {
					return webHooksTable.id;
				},
				{ onDelete: "cascade" },
			),
	},
	(table) => {
		return [primaryKey({ name: "id", columns: [table.appEventId, table.webHookId] })];
	},
);

export const webHooksToAppEventsRelations = relations(webHooksToAppEventsTable, ({ one }) => {
	return {
		webHook: one(webHooksTable, {
			fields: [webHooksToAppEventsTable.webHookId],
			references: [webHooksTable.id],
		}),
		appEvent: one(appEventsTable, {
			fields: [webHooksToAppEventsTable.appEventId],
			references: [appEventsTable.id],
		}),
	};
});

export type DbWebHookAppEventRelation = typeof webHooksToAppEventsTable.$inferSelect;
export type DbWebHookAppEventRelationInput = typeof webHooksToAppEventsTable.$inferInsert;
