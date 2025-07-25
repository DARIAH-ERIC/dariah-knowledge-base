import * as Sentry from "@sentry/nextjs";

import { env } from "@/config/env.config";

Sentry.init({
	debug: false,
	dsn: env.NEXT_PUBLIC_SENTRY_DSN,
	integrations: [Sentry.replayIntegration()],
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	tracesSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
