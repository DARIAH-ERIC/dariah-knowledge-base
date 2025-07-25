import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminPersonsTableContent } from "@/components/admin/persons-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getInstitutions } from "@/lib/data/institution";
import { getPersons } from "@/lib/data/person";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminPersonsPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminPersonsPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminPersonsPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminPersonsPage(
	props: DashboardAdminPersonsPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminPersonsPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminPersonsContent />
		</MainContent>
	);
}

function DashboardAdminPersonsContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminPersonsForm />
			</Suspense>
		</section>
	);
}

async function AdminPersonsForm() {
	const [institutions, persons] = await Promise.all([getInstitutions(), getPersons()]);

	return <AdminPersonsTableContent institutions={institutions} persons={persons} />;
}
