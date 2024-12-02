import type { MiddlewareConfig, NextMiddleware } from "next/server";

import { composeMiddleware } from "@/lib/compose-middlewares";
import { i18nMiddlware } from "@/lib/i18n/i18n-middleware";
import { csrfMiddlware } from "@/lib/server/auth/csrf-middleware";
import { sessionExtensionMiddleware } from "@/lib/server/auth/session-extension-middleware";

export const middleware: NextMiddleware = composeMiddleware(
	csrfMiddlware,
	i18nMiddlware,
	sessionExtensionMiddleware,
);

export const config: MiddlewareConfig = {
	matcher: [
		"/",
		/**
		 * Next.js does not support arbitrary expressions for `matcher`.
		 *
		 * @see https://github.com/vercel/next.js/issues/56398
		 */
		"/(de|en)/:path*",
		"/api/:path*",
	],
};
