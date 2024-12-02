import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";

export const appEvents = pgTable("app-events", {
	id,
	name: text().notNull(),
	...timestamps,
});

export const appEventRelations = relations(appEvents, ({ many }) => {
	return {
		webHooks: many(webHooksToAppEvents),
	};
});

export type DbAppEvent = typeof appEvents.$inferSelect;
export type DbAppEventInput = typeof appEvents.$inferInsert;

export const webHooks = pgTable("web-hooks", {
	id,
	url: text().notNull().unique(),
	signKey: text().notNull(),
	...timestamps,
});

export const webHookRelations = relations(webHooks, ({ many }) => {
	return {
		appEvents: many(webHooksToAppEvents),
	};
});

export type DbWebHook = typeof webHooks.$inferSelect;
export type DbWebHookInput = typeof webHooks.$inferInsert;

export const webHooksToAppEvents = pgTable(
	"web-hooks_app-events",
	{
		appEventId: uuid()
			.notNull()
			.references(
				() => {
					return appEvents.id;
				},
				{ onDelete: "cascade" },
			),
		webHookId: uuid()
			.notNull()
			.references(
				() => {
					return webHooks.id;
				},
				{ onDelete: "cascade" },
			),
	},
	(table) => {
		return [primaryKey({ name: "id", columns: [table.appEventId, table.webHookId] })];
	},
);

export const webHooksToAppEventsRelations = relations(webHooksToAppEvents, ({ one }) => {
	return {
		webHook: one(webHooks, {
			fields: [webHooksToAppEvents.webHookId],
			references: [webHooks.id],
		}),
		appEvent: one(appEvents, {
			fields: [webHooksToAppEvents.appEventId],
			references: [appEvents.id],
		}),
	};
});

export type DbWebHookAppEventRelation = typeof webHooksToAppEvents.$inferSelect;
export type DbWebHookAppEventRelationInput = typeof webHooksToAppEvents.$inferInsert;
