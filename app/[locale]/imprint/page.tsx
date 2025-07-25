import { HttpError, request } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { createImprintUrl } from "@/config/imprint.config";
import type { IntlLocale } from "@/lib/i18n/locales";

interface ImprintPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: ImprintPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "ImprintPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ImprintPage(props: ImprintPageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("ImprintPage");

	return (
		<MainContent className="container grid max-w-(--breakpoint-md) content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<ImprintPageContent locale={locale} />
		</MainContent>
	);
}

interface ImprintPageContentProps {
	locale: IntlLocale;
}

async function ImprintPageContent(props: ImprintPageContentProps) {
	const { locale } = props;

	const html = await getImprintHtml(locale);

	return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm" />;
}

async function getImprintHtml(locale: IntlLocale): Promise<string> {
	try {
		const url = createImprintUrl(locale);
		const html = await request(url, { responseType: "text" });

		return html;
	} catch (error) {
		if (error instanceof HttpError && error.response.status === 404) {
			notFound();
		}

		throw error;
	}
}
