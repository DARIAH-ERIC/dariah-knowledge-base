import { log, times } from "@acdh-oeaw/lib";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import * as schema from "@/db/schema";
import { encryptString } from "@/lib/server/auth/encryption";
import { generateRandomRecoveryCode } from "@/lib/server/auth/utils";

const client = postgres({ ...credentials, max: 1 });

const db = drizzle(client, {
	casing: "snake_case",
	logger: true,
	schema,
});

async function main() {
	for (const table of [schema.emailVerificationRequestsTable, schema.usersTable]) {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(table);
	}

	/** Users. */

	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = Buffer.from(encryptString(recoveryCode));

	const users = times(10).map(() => {
		const user: schema.DbUserInput = {
			username: faker.internet.username(),
			email: faker.internet.email(),
			passwordHash: faker.internet.password({ memorable: true }),
			recoveryCode: encryptedRecoveryCode,
		};

		return user;
	});

	await db.insert(schema.usersTable).values(users);

	// eslint-disable-next-line no-console
	console.table(users);
}

main()
	.then(() => {
		log.success("Successfully seeded database.");
	})
	.catch((error: unknown) => {
		log.error("Failed to seed database.\n", String(error));
		process.exitCode = 1;
	})
	.finally(() => {
		db.$client.end().catch((error: unknown) => {
			log.error(String(error));
			process.exitCode = 1;
		});
	});
