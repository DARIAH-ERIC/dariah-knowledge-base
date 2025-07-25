import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { ContactForm } from "@/components/contact-form";
import { MainContent } from "@/components/main-content";
import { PageLeadIn } from "@/components/page-lead-in";
import { PageTitle } from "@/components/page-title";
import type { IntlLocale } from "@/lib/i18n/locales";
import { contactPageSearchParams } from "@/lib/schemas/email";

interface ContactPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
	searchParams: Promise<Record<string, Array<string> | string>>;
}

export async function generateMetadata(
	props: ContactPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "ContactPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ContactPage(props: ContactPageProps): Promise<ReactNode> {
	const { params, searchParams } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("ContactPage");

	const contactSearchParams = contactPageSearchParams.parse(await searchParams);

	return (
		<MainContent className="container grid max-w-(--breakpoint-md) content-start gap-8 py-8">
			<PageTitle>{t("title")}</PageTitle>
			<PageLeadIn>{t("lead-in")}</PageLeadIn>

			<ContactForm {...contactSearchParams} />
		</MainContent>
	);
}
