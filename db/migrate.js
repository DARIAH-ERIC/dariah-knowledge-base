import { log } from "@acdh-oeaw/lib";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { credentials } from "../config/db.config.js";
import config from "../config/drizzle.config.js";

const client = postgres({ ...credentials, max: 1 });

const db = drizzle(client, {
	casing: "snake_case",
	logger: true,
});

async function main() {
	await migrate(db, { migrationsFolder: /** @type {string} */ (config.out) });
}

main()
	.then(() => {
		log.success("Successfully applied database migrations.");
	})
	.catch((/** @type {unknown} */ error) => {
		log.error("Failed to apply database migrations.\n", String(error));
		// eslint-disable-next-line no-undef
		process.exitCode = 1;
	})
	.finally(() => {
		db.$client.end().catch((/** @type {unknown} */ error) => {
			log.error(String(error));
			// eslint-disable-next-line no-undef
			process.exitCode = 1;
		});
	});

// TODO: actually throw when we cannot apply migrations?
