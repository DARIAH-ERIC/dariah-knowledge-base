import { log, times } from "@acdh-oeaw/lib";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
// import { seed } from "drizzle-seed";
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
	for (const table of [
		schema.webHooksTable,
		schema.appEventsTable,
		schema.passwordResetSessionsTable,
		schema.emailVerificationRequestsTable,
		schema.sessionsTable,
		schema.usersTable,
		schema.institutionsTable,
		schema.countriesTable,
	]) {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(table);
	}

	/** Countries. */

	const countries = times(10).map(() => {
		const country: schema.DbCountryInput = {
			code: faker.location.countryCode({ variant: "alpha-2" }),
			name: faker.location.country(),
			type: faker.helpers.arrayElement(["cooperating_partnership", "member_country", "other"]),
		};

		return country;
	});

	await db.insert(schema.countriesTable).values(countries);

	/** Institutions. */

	const institutions = times(10).map(() => {
		const institution: schema.DbInstitutionInput = {
			name: faker.company.name(),
			types: faker.helpers.arrayElements([
				"cooperating_partner",
				"national_coordinating_institution",
				"national_representative_institution",
				"other",
				"partner_institution",
			]),
			startDate: faker.date.between({ from: "2010-01-01", to: "2020-01-01" }),
			endDate: faker.date.future({ refDate: "2020-01-01" }),
			ror: faker.internet.url(),
			url: [faker.internet.url()],
		};

		return institution;
	});

	await db.insert(schema.institutionsTable).values(institutions);

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
