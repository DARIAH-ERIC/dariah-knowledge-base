import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { IntlLocale } from "@/lib/i18n/locales";

interface NotFoundPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: NotFoundPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "NotFoundPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
		robots: {
			index: false,
		},
	};

	return metadata;
}

export default function NotFoundPage(_props: NotFoundPageProps): ReactNode {
	const t = useTranslations("NotFoundPage");

	return (
		<MainContent className="container grid place-content-center py-8">
			<PageTitle>{t("title")}</PageTitle>
		</MainContent>
	);
}
