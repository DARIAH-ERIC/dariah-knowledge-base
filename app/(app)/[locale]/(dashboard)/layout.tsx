import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import type { Locale } from "@/config/i18n.config";

interface DashboardLayoutProps {
	children: ReactNode;
	params: Promise<{
		locale: Locale;
	}>;
}

export default async function DashboardLayout(
	props: Readonly<DashboardLayoutProps>,
): Promise<ReactNode> {
	const { children, params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	return children;
}
