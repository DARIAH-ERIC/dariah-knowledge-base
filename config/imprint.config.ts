import { createUrl, createUrlSearchParams } from "@acdh-oeaw/lib";

import { env } from "@/config/env.config";
import type { IntlLocale } from "@/lib/i18n/locales";

export function createImprintUrl(locale: IntlLocale): URL {
	return createUrl({
		baseUrl: "https://imprint.acdh.oeaw.ac.at",
		pathname: `/${String(env.NEXT_PUBLIC_REDMINE_ID)}`,
		searchParams: createUrlSearchParams({ locale }),
	});
}
