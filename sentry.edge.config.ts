import * as Sentry from "@sentry/nextjs";

import { env } from "@/config/env.config";

Sentry.init({
	debug: false,
	dsn: env.NEXT_PUBLIC_SENTRY_DSN,
	ignoreErrors: ["NEXT_NOT_FOUND"],
	tracesSampleRate: 1,
});
