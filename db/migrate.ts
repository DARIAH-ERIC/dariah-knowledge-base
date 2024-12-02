import { log } from "@acdh-oeaw/lib";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import config from "@/config/drizzle.config";

const client = postgres({ ...credentials, max: 1 });

const db = drizzle(client, {
	casing: "snake_case",
	logger: true,
});

async function main() {
	await migrate(db, { migrationsFolder: config.out! });
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	.catch((error: unknown) => {
		log.error("Failed to apply database migrations.\n", String(error));
		// eslint-disable-next-line n/no-process-exit
		process.exit(1);
	})
	.finally(() => {
		db.$client.end().catch((error: unknown) => {
			log.error(String(error));
			// eslint-disable-next-line n/no-process-exit
			process.exit(1);
		});
	});
