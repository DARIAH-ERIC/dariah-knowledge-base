import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminProjectsFundingsTableContent } from "@/components/admin/projects-fundings-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getProjectsFundingLeverages } from "@/lib/data/project-funding-leverage";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminProjectFundingsPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminProjectFundingsPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminProjectsFundingsPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminProjectFundingsPage(
	props: DashboardAdminProjectFundingsPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminProjectsFundingsPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminProjectFundingsContent />
		</MainContent>
	);
}

function DashboardAdminProjectFundingsContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminProjectFundingsForm />
			</Suspense>
		</section>
	);
}

async function AdminProjectFundingsForm() {
	const [projectsFundingLeverages] = await Promise.all([getProjectsFundingLeverages()]);

	return <AdminProjectsFundingsTableContent projectsFundingLeverages={projectsFundingLeverages} />;
}
