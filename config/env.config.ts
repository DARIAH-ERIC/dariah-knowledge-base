/* eslint-disable no-restricted-syntax */

import { log } from "@acdh-oeaw/lib";
import { createEnv } from "@acdh-oeaw/validate-env/next";
import * as v from "valibot";

export const env = createEnv({
	system(input) {
		const Schema = v.object({
			NODE_ENV: v.optional(v.picklist(["development", "production", "test"]), "production"),
		});

		return v.parse(Schema, input);
	},
	private(input) {
		const Schema = v.object({
			BUILD_MODE: v.optional(v.picklist(["export", "standalone"])),
			BUNDLE_ANALYZER: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			CI: v.optional(v.pipe(v.unknown(), v.transform(Boolean), v.boolean())),
			DB_HOST: v.pipe(v.string(), v.nonEmpty()),
			DB_NAME: v.pipe(v.string(), v.nonEmpty()),
			DB_PASSWORD: v.pipe(v.string(), v.minLength(8)),
			DB_PORT: v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1000)),
			DB_USER: v.pipe(v.string(), v.nonEmpty()),
			EMAIL_ADDRESS: v.pipe(v.string(), v.email()),
			EMAIL_SMTP_PASSWORD: v.optional(v.pipe(v.string(), v.minLength(8))),
			EMAIL_SMTP_PORT: v.pipe(
				v.string(),
				v.transform(Number),
				v.number(),
				v.integer(),
				v.minValue(1),
			),
			EMAIL_SMTP_SERVER: v.pipe(v.string(), v.nonEmpty()),
			EMAIL_SMTP_USERNAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
			ENCRYPTION_KEY: v.pipe(v.string(), v.minLength(24)),
			KEYSTATIC_GITHUB_CLIENT_ID: v.optional(v.pipe(v.string(), v.nonEmpty())),
			KEYSTATIC_GITHUB_CLIENT_SECRET: v.optional(v.pipe(v.string(), v.nonEmpty())),
			KEYSTATIC_SECRET: v.optional(v.pipe(v.string(), v.nonEmpty())),
			OPENTELEMETRY_COLLECTOR_URL: v.optional(v.pipe(v.string(), v.url())),
			OPENTELEMETRY_SERVICE_NAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
			SENTRY_AUTH_TOKEN: v.optional(v.pipe(v.string(), v.nonEmpty())),
			SSHOC_MARKETPLACE_API_BASE_URL: v.pipe(v.string(), v.url()),
			SSHOC_MARKETPLACE_BASE_URL: v.pipe(v.string(), v.url()),
			SSHOC_MARKETPLACE_PASSWORD: v.pipe(v.string(), v.nonEmpty()),
			SSHOC_MARKETPLACE_USERNAME: v.pipe(v.string(), v.nonEmpty()),
		});

		return v.parse(Schema, input);
	},
	public(input) {
		const Schema = v.object({
			NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
			NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: v.optional(v.string()),
			NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: v.optional(v.pipe(v.string(), v.nonEmpty())),
			NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
			NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER: v.optional(v.pipe(v.string(), v.nonEmpty())),
			NEXT_PUBLIC_KEYSTATIC_MODE: v.optional(v.picklist(["github", "local"]), "local"),
			NEXT_PUBLIC_MATOMO_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
			NEXT_PUBLIC_MATOMO_ID: v.optional(
				v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
			),
			NEXT_PUBLIC_REDMINE_ID: v.pipe(
				v.string(),
				v.transform(Number),
				v.number(),
				v.integer(),
				v.minValue(1),
			),
		});

		return v.parse(Schema, input);
	},
	environment: {
		BUILD_MODE: process.env.BUILD_MODE,
		BUNDLE_ANALYZER: process.env.BUNDLE_ANALYZER,
		CI: process.env.CI,
		DB_HOST: process.env.DB_HOST,
		DB_NAME: process.env.DB_NAME,
		DB_PASSWORD: process.env.DB_PASSWORD,
		DB_PORT: process.env.DB_PORT,
		DB_USER: process.env.DB_USER,
		EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
		EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD,
		EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
		EMAIL_SMTP_SERVER: process.env.EMAIL_SMTP_SERVER,
		EMAIL_SMTP_USERNAME: process.env.EMAIL_SMTP_USERNAME,
		ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
		KEYSTATIC_GITHUB_CLIENT_ID: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
		KEYSTATIC_GITHUB_CLIENT_SECRET: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
		KEYSTATIC_SECRET: process.env.KEYSTATIC_SECRET,
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
		NODE_ENV: process.env.NODE_ENV,
		OPENTELEMETRY_COLLECTOR_URL: process.env.OPENTELEMETRY_COLLECTOR_URL,
		OPENTELEMETRY_SERVICE_NAME: process.env.OPENTELEMETRY_SERVICE_NAME,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		SSHOC_MARKETPLACE_API_BASE_URL: process.env.SSHOC_MARKETPLACE_API_BASE_URL,
		SSHOC_MARKETPLACE_BASE_URL: process.env.SSHOC_MARKETPLACE_BASE_URL,
		SSHOC_MARKETPLACE_PASSWORD: process.env.SSHOC_MARKETPLACE_PASSWORD,
		SSHOC_MARKETPLACE_USERNAME: process.env.SSHOC_MARKETPLACE_USERNAME,
	},
	validation: v.parse(
		v.optional(v.picklist(["disabled", "enabled", "public"]), "enabled"),
		process.env.ENV_VALIDATION,
	),
	onError(error) {
		if (error instanceof v.ValiError) {
			const message = "Invalid environment variables";

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			log.error(`${message}:`, v.flatten(error.issues).nested);

			const validationError = new Error(message);
			delete validationError.stack;

			throw validationError;
		}

		throw error;
	},
});
