import * as Sentry from "@sentry/nextjs";

import { env } from "@/config/env.config";

Sentry.init({
	debug: false,
	dsn: env.NEXT_PUBLIC_SENTRY_DSN,
	ignoreErrors: ["NEXT_NOT_FOUND"],
	integrations: [
		Sentry.replayIntegration({
			blockAllMedia: true,
			maskAllText: true,
		}),
	],
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	tracesSampleRate: 1,
});
