import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AppFooter } from "@/app/[locale]/_components/app-footer";
import { AppHeader } from "@/app/[locale]/_components/app-header";
import { AppLayout } from "@/app/[locale]/_components/app-layout";
import type { Locale } from "@/config/i18n.config";

interface ContentLayoutProps {
	children: ReactNode;
	params: Promise<{
		locale: Locale;
	}>;
}

export default async function ContentLayout(
	props: Readonly<ContentLayoutProps>,
): Promise<ReactNode> {
	const { children, params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<AppLayout>
			<AppHeader />
			{children}
			<AppFooter />
		</AppLayout>
	);
}
