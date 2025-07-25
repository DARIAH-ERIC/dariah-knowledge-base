import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminOutreachTableContent } from "@/components/admin/outreach-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getCountries } from "@/lib/data/country";
import { getOutreach } from "@/lib/data/outreach";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminOutreachPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminOutreachPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminOutreachPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminOutreachPage(
	props: DashboardAdminOutreachPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminOutreachPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminOutreachPageContent />
		</MainContent>
	);
}

function DashboardAdminOutreachPageContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminOutreachTable />
			</Suspense>
		</section>
	);
}

async function AdminOutreachTable() {
	const [countries, outreach] = await Promise.all([getCountries(), getOutreach()]);

	return <AdminOutreachTableContent countries={countries} outreach={outreach} />;
}
