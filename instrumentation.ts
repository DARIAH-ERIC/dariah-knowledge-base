import * as Sentry from "@sentry/nextjs";

import { env } from "@/config/env.config";

export async function register(): Promise<void> {
	if (env.NEXT_RUNTIME === "nodejs") {
		await import("@/sentry.server.config");
	}

	if (env.NEXT_RUNTIME === "edge") {
		await import("@/sentry.edge.config");
	}
}

export const onRequestError = Sentry.captureRequestError;
