import "server-only";

import { PrismaClient } from "@prisma/client";

import { env } from "@/config/env.config";

declare global {
	var db: PrismaClient | undefined;
}

export const db = globalThis.db ?? new PrismaClient();

/** Avoid re-creating database clients on hot-module-reload. */
if (env.NODE_ENV !== "production") {
	globalThis.db = db;
}
