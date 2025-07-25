"use client";

import type { ReactNode } from "react";
import {
	I18nProvider as AriaI18nProvider,
	RouterProvider as AriaRouterProvider,
} from "react-aria-components";

import type { IntlLocale } from "@/lib/i18n/locales";
import { useRouter } from "@/lib/navigation/navigation";

interface AriaProvidersProps {
	children: ReactNode;
	locale: IntlLocale;
}

export function AriaProviders(props: Readonly<AriaProvidersProps>): ReactNode {
	const { children, locale } = props;

	const router = useRouter();

	return (
		<AriaI18nProvider locale={locale}>
			<AriaRouterProvider navigate={router.push}>{children}</AriaRouterProvider>
		</AriaI18nProvider>
	);
}
