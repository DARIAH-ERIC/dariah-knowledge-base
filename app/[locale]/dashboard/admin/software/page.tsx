import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminSoftwareTableContent } from "@/components/admin/software-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getCountries } from "@/lib/data/country";
import { getSoftware } from "@/lib/data/software";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminSoftwarePageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminSoftwarePageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminSoftwarePage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminSoftwarePage(
	props: DashboardAdminSoftwarePageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminSoftwarePage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminSoftwarePageContent />
		</MainContent>
	);
}

function DashboardAdminSoftwarePageContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminSoftwareTable />
			</Suspense>
		</section>
	);
}

async function AdminSoftwareTable() {
	const [countries, software] = await Promise.all([getCountries(), getSoftware()]);

	return <AdminSoftwareTableContent countries={countries} software={software} />;
}
