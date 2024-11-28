import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

interface TermsOfUsePageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<TermsOfUsePageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "TermsOfUsePage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function TermsOfUsePage(
	props: Readonly<TermsOfUsePageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("TermsOfUsePage");

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative grid gap-y-2 bg-fill-weaker py-16 xs:py-20">
				<h1 className="text-balance font-heading text-display font-strong text-text-strong">
					{t("title")}
				</h1>
			</section>

			<section className="layout-subgrid typography relative border-t border-stroke-weak py-16 xs:py-20"></section>
		</MainContent>
	);
}
