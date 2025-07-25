import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminContributionsTableContent } from "@/components/admin/contributions-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getContributionsWithDetails } from "@/lib/data/contributions";
import { getCountries } from "@/lib/data/country";
import { getPersons } from "@/lib/data/person";
import { getRoles } from "@/lib/data/role";
import { getWorkingGroups } from "@/lib/data/working-group";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminContributionsPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminContributionsPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminContributionsPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminContributionsPage(
	props: DashboardAdminContributionsPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminContributionsPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminContributionsContent />
		</MainContent>
	);
}

function DashboardAdminContributionsContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminContributionsForm />
			</Suspense>
		</section>
	);
}

async function AdminContributionsForm() {
	const [contributions, countries, persons, roles, workingGroups] = await Promise.all([
		getContributionsWithDetails(),
		getCountries(),
		getPersons(),
		getRoles(),
		getWorkingGroups(),
	]);

	return (
		<AdminContributionsTableContent
			contributions={contributions}
			countries={countries}
			persons={persons}
			roles={roles}
			workingGroups={workingGroups}
		/>
	);
}
