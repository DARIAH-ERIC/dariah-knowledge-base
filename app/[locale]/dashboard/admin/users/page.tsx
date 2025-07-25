import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { AdminUsersTableContent } from "@/components/admin/users-table-content";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getCountries } from "@/lib/data/country";
import { getUsers } from "@/lib/data/user";
import type { IntlLocale } from "@/lib/i18n/locales";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardAdminUsersPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardAdminUsersPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardAdminUsersPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardAdminUsersPage(
	props: DashboardAdminUsersPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardAdminUsersPage");

	await assertAuthenticated(["admin"]);

	return (
		<MainContent className="container grid max-w-(--breakpoint-2xl)! content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardAdminUsersContent />
		</MainContent>
	);
}

function DashboardAdminUsersContent() {
	return (
		<section className="grid gap-y-8">
			<Suspense>
				<AdminUsersForm />
			</Suspense>
		</section>
	);
}

async function AdminUsersForm() {
	const [countries, users] = await Promise.all([getCountries(), getUsers()]);

	return <AdminUsersTableContent countries={countries} users={users} />;
}
