/* eslint-disable no-restricted-syntax */

import { log } from "@acdh-oeaw/lib";
import { createEnv } from "@acdh-oeaw/validate-env/next";
import { z } from "zod";

export const env = createEnv({
	system(input) {
		const Schema = z.object({
			NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
		});
		return Schema.parse(input);
	},
	private(input) {
		const Schema = z.object({
			BASEROW_API_BASE_URL: z.string().url().optional(),
			BASEROW_DATABASE_ID: z.string().min(1).optional(),
			BASEROW_EMAIL: z.string().email().optional(),
			BASEROW_PASSWORD: z.string().min(1).optional(),
			BUILD_MODE: z.enum(["export", "standalone"]).default("standalone"),
			BUNDLE_ANALYZER: z.enum(["disabled", "enabled"]).default("disabled"),
			CI: z.unknown().transform(Boolean).optional(),
			DATABASE_ADMIN_USER_EMAIL: z.string().email().optional(),
			DATABASE_ADMIN_USER_NAME: z.string().min(1).optional(),
			/** bcrypt supports max. 72 characters. */
			DATABASE_ADMIN_USER_PASSWORD: z.string().min(32).max(72).optional(),
			DATABASE_DIRECT_URL: z.string().url(),
			DATABASE_TEST_USER_COUNTRY_CODE: z.string().min(2).max(2).optional(),
			DATABASE_TEST_USER_EMAIL: z.string().email().optional(),
			DATABASE_TEST_USER_NAME: z.string().min(1).optional(),
			DATABASE_TEST_USER_PASSWORD: z.string().min(8).optional(),
			DATABASE_URL: z.string().url(),
			EMAIL_CONTACT_ADDRESS: z.string().email(),
			EMAIL_PASSWORD: z.string().min(1).optional(),
			EMAIL_SMTP_PORT: z.coerce.number().int().positive(),
			EMAIL_SMTP_SERVER: z.string().min(1),
			EMAIL_USER_NAME: z.string().email().optional(),
			KEYSTATIC_GITHUB_CLIENT_ID: z.string().min(1).optional(),
			KEYSTATIC_GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
			KEYSTATIC_SECRET: z.string().min(1).optional(),
			NEXT_RUNTIME: z.enum(["edge", "nodejs"]).optional(),
			SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
			SSHOC_MARKETPLACE_API_BASE_URL: z.string().url(),
			SSHOC_MARKETPLACE_BASE_URL: z.string().url(),
			SSHOC_MARKETPLACE_PASSWORD: z.string().min(1),
			SSHOC_MARKETPLACE_USER_NAME: z.string().min(1),
		});
		return Schema.parse(input);
	},
	public(input) {
		const Schema = z.object({
			NEXT_PUBLIC_APP_BASE_URL: z.string().url(),
			NEXT_PUBLIC_BOTS: z.enum(["disabled", "enabled"]).default("disabled"),
			NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
			NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: z.string().min(1).optional(),
			NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME: z.string().min(1).optional(),
			NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER: z.string().min(1).optional(),
			NEXT_PUBLIC_KEYSTATIC_MODE: z.enum(["github", "local"]).default("local"),
			NEXT_PUBLIC_MATOMO_BASE_URL: z.string().url().optional(),
			NEXT_PUBLIC_MATOMO_ID: z.coerce.number().int().positive().optional(),
			NEXT_PUBLIC_REDMINE_ID: z.coerce.number().int().positive(),
			NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
			NEXT_PUBLIC_SENTRY_ORG: z.string().min(1).optional(),
			NEXT_PUBLIC_SENTRY_PROJECT: z.string().min(1).optional(),
		});
		return Schema.parse(input);
	},
	environment: {
		BASEROW_API_BASE_URL: process.env.BASEROW_API_BASE_URL,
		BASEROW_DATABASE_ID: process.env.BASEROW_DATABASE_ID,
		BASEROW_EMAIL: process.env.BASEROW_EMAIL,
		BASEROW_PASSWORD: process.env.BASEROW_PASSWORD,
		BUILD_MODE: process.env.BUILD_MODE,
		BUNDLE_ANALYZER: process.env.BUNDLE_ANALYZER,
		CI: process.env.CI,
		DATABASE_ADMIN_USER_EMAIL: process.env.DATABASE_ADMIN_USER_EMAIL,
		DATABASE_ADMIN_USER_NAME: process.env.DATABASE_ADMIN_USER_NAME,
		DATABASE_ADMIN_USER_PASSWORD: process.env.DATABASE_ADMIN_USER_PASSWORD,
		DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
		DATABASE_TEST_USER_COUNTRY_CODE: process.env.DATABASE_TEST_USER_COUNTRY_CODE,
		DATABASE_TEST_USER_EMAIL: process.env.DATABASE_TEST_USER_EMAIL,
		DATABASE_TEST_USER_NAME: process.env.DATABASE_TEST_USER_NAME,
		DATABASE_TEST_USER_PASSWORD: process.env.DATABASE_TEST_USER_PASSWORD,
		DATABASE_URL: process.env.DATABASE_URL,
		EMAIL_CONTACT_ADDRESS: process.env.EMAIL_CONTACT_ADDRESS,
		EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
		EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
		EMAIL_SMTP_SERVER: process.env.EMAIL_SMTP_SERVER,
		EMAIL_USER_NAME: process.env.EMAIL_USER_NAME,
		KEYSTATIC_GITHUB_CLIENT_ID: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
		KEYSTATIC_GITHUB_CLIENT_SECRET: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
		KEYSTATIC_SECRET: process.env.KEYSTATIC_SECRET,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_BOTS: process.env.NEXT_PUBLIC_BOTS,
		NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
		NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
		NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
		NEXT_PUBLIC_KEYSTATIC_MODE: process.env.NEXT_PUBLIC_KEYSTATIC_MODE,
		NEXT_PUBLIC_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_MATOMO_BASE_URL,
		NEXT_PUBLIC_MATOMO_ID: process.env.NEXT_PUBLIC_MATOMO_ID,
		NEXT_PUBLIC_REDMINE_ID: process.env.NEXT_PUBLIC_REDMINE_ID,
		NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
		NEXT_PUBLIC_SENTRY_ORG: process.env.NEXT_PUBLIC_SENTRY_ORG,
		NEXT_PUBLIC_SENTRY_PROJECT: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
		NEXT_RUNTIME: process.env.NEXT_RUNTIME,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		SSHOC_MARKETPLACE_API_BASE_URL: process.env.SSHOC_MARKETPLACE_API_BASE_URL,
		SSHOC_MARKETPLACE_BASE_URL: process.env.SSHOC_MARKETPLACE_BASE_URL,
		SSHOC_MARKETPLACE_PASSWORD: process.env.SSHOC_MARKETPLACE_PASSWORD,
		SSHOC_MARKETPLACE_USER_NAME: process.env.SSHOC_MARKETPLACE_USER_NAME,
	},
	validation: z
		.enum(["disabled", "enabled", "public"])
		.default("enabled")
		.parse(process.env.ENV_VALIDATION),
	onError(error) {
		if (error instanceof z.ZodError) {
			const message = "Invalid environment variables";
			log.error(`${message}:`, error.flatten().fieldErrors);
			const validationError = new Error(message);
			delete validationError.stack;
			throw validationError;
		}

		throw error;
	},
});
