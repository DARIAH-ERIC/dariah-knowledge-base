import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminInstitutionsTableContent } from "@/components/admin/institutions-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getCountries } from "@/lib/data/country";
import { getInstitutions } from "@/lib/data/institution";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminInstitutionsPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminInstitutionsPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminInstitutionsPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminInstitutionsPage(
	props: DashboardAdminInstitutionsPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminInstitutionsPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminInstitutionsContent />
		</MainContent>
	);
}

function DashboardAdminInstitutionsContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminInstitutionsForm />
			</Suspense>
		</section>
	);
}

async function AdminInstitutionsForm() {
	const [countries, institutions] = await Promise.all([getCountries(), getInstitutions()]);

	return <AdminInstitutionsTableContent countries={countries} institutions={institutions} />;
}
