import { customType } from "drizzle-orm/pg-core";

/** @see https://github.com/drizzle-team/drizzle-orm/issues/298 */
export const bytea = customType<{ data: Buffer; default: false }>({
	dataType() {
		return "bytea";
	},
});
