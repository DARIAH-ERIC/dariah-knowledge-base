import { assert, log } from "@acdh-oeaw/lib";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

import { env } from "@/config/env.config";

const db = new PrismaClient();

async function createTestnUser() {
	const testUser = getTestnUser();

	const country = await db.country.findFirst({
		where: {
			code: testUser.countryCode,
		},
	});

	assert(country != null);

	await db.user.create({
		data: {
			email: testUser.email,
			name: testUser.name,
			password: await hash(testUser.password, 10),
			status: "verified",
			country: {
				connect: {
					id: country.id,
				},
			},
		},
	});
}

createTestnUser()
	.then(() => {
		log.success("Successfully created test user in the database.");
	})
	.catch((error) => {
		log.error("Failed to create test user in the database.\n", error);
		process.exitCode = 1;
	})
	.finally(() => {
		return db.$disconnect();
	});

// ------------------------------------------------------------------------------------------------

function getTestnUser() {
	assert(env.DATABASE_TEST_USER_COUNTRY_CODE);
	assert(env.DATABASE_TEST_USER_EMAIL);
	assert(env.DATABASE_TEST_USER_NAME);
	assert(env.DATABASE_TEST_USER_PASSWORD);

	return {
		countryCode: env.DATABASE_TEST_USER_COUNTRY_CODE,
		email: env.DATABASE_TEST_USER_EMAIL,
		name: env.DATABASE_TEST_USER_NAME,
		password: env.DATABASE_TEST_USER_PASSWORD,
	};
}
