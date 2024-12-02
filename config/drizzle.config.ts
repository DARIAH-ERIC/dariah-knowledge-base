import { defineConfig } from "drizzle-kit";

import { credentials } from "@/config/db.config";

// eslint-disable-next-line import-x/no-default-export
export default defineConfig({
	casing: "snake_case",
	dbCredentials: credentials,
	dialect: "postgresql",
	out: "./db/migrations/",
	schema: "./db/schema/",
	strict: true,
	verbose: true,
});
