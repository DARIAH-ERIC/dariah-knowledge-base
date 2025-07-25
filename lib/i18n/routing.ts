import { defineRouting, type LocalePrefix } from "next-intl/routing";

import { defaultLocale, locales } from "@/lib/i18n/locales";

export const localePrefix = {
	mode: "always",
	prefixes: {
		"en-GB": "/en",
	},
} as const satisfies LocalePrefix<typeof locales>;

export const routing = defineRouting({
	defaultLocale,
	/**
	 * For GDPR-conformance, the locale cookie is stored as a session cookie, which expires when
	 * the browser is closed. When using an explicit cookie consent banner, the cookie expiration
	 * can be adjusted via `maxAge`.
	 */
	// localeCookie: {
	// 	maxAge: 60 * 60 * 24 * 365 /** 1 year. */,
	// },
	localePrefix,
	locales,
});
