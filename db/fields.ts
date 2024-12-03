// import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();

export const timestamps = {
	createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: "date", withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => {
			/** @see https://github.com/drizzle-team/drizzle-orm/issues/2212 */
			// return sql`CURRENT_TIMESTAMP`;
			return new Date();
		}),
};
