import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminWorkingGroupsTableContent } from "@/components/admin/working-groups-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { Locale } from "@/config/i18n.config";
import { getContributions } from "@/lib/data/contributions";
import { getPersons } from "@/lib/data/person";
import { getWorkingGroups } from "@/lib/data/working-group";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminWorkingGroupsPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: DashboardAdminWorkingGroupsPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminWorkingGroupsPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminWorkingGroupsPage(
	props: DashboardAdminWorkingGroupsPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminWorkingGroupsPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid !max-w-screen-2xl content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminWorkingGroupsContent />
		</MainContent>
	);
}

function DashboardAdminWorkingGroupsContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminWorkingGroupsForm />
			</Suspense>
		</section>
	);
}

async function AdminWorkingGroupsForm() {
	const [contributions, persons, workingGroups] = await Promise.all([
		getContributions(),
		getPersons(),
		getWorkingGroups(),
	]);

	return (
		<AdminWorkingGroupsTableContent
			chairs={contributions}
			persons={persons}
			workingGroups={workingGroups}
		/>
	);
}
