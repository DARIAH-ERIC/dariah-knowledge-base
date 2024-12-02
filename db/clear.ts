import { log } from "@acdh-oeaw/lib";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import * as schema from "@/db/schema";

const client = postgres({ ...credentials, max: 1 });

const db = drizzle(client, {
	casing: "snake_case",
	logger: true,
});

async function main() {
	for (const table of [schema.emailVerificationRequestsTable, schema.usersTable]) {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(table);
	}
}

main()
	.then(() => {
		log.success("Successfully cleared database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to clear database.\n", String(error));
		process.exitCode = 1;
	})
	.finally(() => {
		db.$client.end().catch((error: unknown) => {
			log.error(String(error));
			process.exitCode = 1;
		});
	});
