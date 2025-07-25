import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getReportByCountryCode } from "@/lib/data/report";
import { getCountryCodes as getStaticCountryCodes } from "@/lib/get-country-codes";
import { getReportYears } from "@/lib/get-report-years";
import type { IntlLocale } from "@/lib/i18n/locales";
import { dashboardCountryReportPageParams } from "@/lib/schemas/dashboard";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardCountryReportPageProps {
	params: Promise<{
		code: string;
		locale: IntlLocale;
		year: string;
	}>;
}

// export const dynamicParams = false;

export async function generateStaticParams(_props: {
	params: Pick<Awaited<DashboardCountryReportPageProps["params"]>, "locale">;
}): Promise<Array<Pick<Awaited<DashboardCountryReportPageProps["params"]>, "code" | "year">>> {
	/**
	 * FIXME: we cannot access the postgres database on acdh servers from github ci/cd, so we cannot
	 * query for country codes (or report years) at build time.
	 */
	// const countries = await getCountryCodes();
	const countries = await Promise.resolve(Array.from(getStaticCountryCodes().values()));

	const years = getReportYears();

	const params = years.flatMap((year) => {
		return countries.map((code) => {
			return { code, year };
		});
	});

	return params;
}

export async function generateMetadata(
	props: DashboardCountryReportPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardCountryReportPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardCountryReportPage(
	props: DashboardCountryReportPageProps,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardCountryReportPage");

	await assertAuthenticated();

	const result = dashboardCountryReportPageParams.safeParse(await params);
	if (!result.success) notFound();
	const { code, year } = result.data;

	return (
		<MainContent className="container grid content-start gap-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardCountryReportPageContent code={code} year={year} />
		</MainContent>
	);
}

interface DashboardCountryReportPageContentProps {
	code: string;
	year: number;
}

async function DashboardCountryReportPageContent(props: DashboardCountryReportPageContentProps) {
	const { code, year } = props;

	const report = await getReportByCountryCode({ countryCode: code, year });
	if (report == null) notFound();

	return null;
}
