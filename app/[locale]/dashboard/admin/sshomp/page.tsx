import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AdminSshompIngestFormContent } from "@/components/admin/sshomp-ingest-form-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminSshompIngestPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminSshompIngestPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminSshompIngestPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminSshompIngestPage(
	props: DashboardAdminSshompIngestPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminSshompIngestPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminSshompIngestContent />
		</MainContent>
	);
}

function DashboardAdminSshompIngestContent() {
	return (
		<section className="grid gap-y-8">
			<AdminSshompIngestFormContent />
		</section>
	);
}
