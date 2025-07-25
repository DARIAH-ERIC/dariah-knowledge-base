import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useMemo } from "react";

import { LocaleSelect } from "@/components/locale-select";
import { getIntlLanguage, type IntlLocale, locales } from "@/lib/i18n/locales";

export function LocaleSwitcher(): ReactNode {
	const currentLocale = useLocale();
	const t = useTranslations("LocaleSwitcher");

	const items = useMemo(() => {
		const displayNames = new Intl.DisplayNames([currentLocale], { type: "language" });

		return Object.fromEntries(
			locales.map((locale) => {
				return [locale, displayNames.of(getIntlLanguage(locale))];
			}),
		) as Record<IntlLocale, string>;
	}, [currentLocale]);

	return <LocaleSelect items={items} label={t("switch-locale")} />;
}
