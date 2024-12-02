import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { credentials } from "@/config/db.config";
import { env } from "@/config/env.config";
import * as schema from "@/db/schema";

declare global {
	// eslint-disable-next-line no-var
	var __db: Awaited<ReturnType<typeof createDatabaseClient>> | undefined;
}

function createDatabaseClient() {
	const client = postgres(credentials);

	return drizzle(client, {
		casing: "snake_case",
		logger: env.NODE_ENV === "development",
		schema,
	});
}

export const db = globalThis.__db ?? createDatabaseClient();

/** Avoid re-creating database client on hot-module-reload. */
if (env.NODE_ENV !== "production") {
	globalThis.__db = db;
}
