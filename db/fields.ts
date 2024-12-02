import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();

export const timestamps = {
	createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: "date", withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => {
			return sql`CURRENT_TIMESTAMP`;
		}),
};
