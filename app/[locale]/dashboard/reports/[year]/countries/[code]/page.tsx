import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { Locale } from "@/config/i18n.config";
import { getReportByCountryCode } from "@/lib/data/report";
import { getCountryCodes as getStaticCountryCodes } from "@/lib/get-country-codes";
import { getReportYears } from "@/lib/get-report-years";
import { dashboardCountryReportPageParams } from "@/lib/schemas/dashboard";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardCountryReportPageProps {
	params: {
		code: string;
		locale: Locale;
		year: string;
	};
}

// export const dynamicParams = false;

export async function generateStaticParams(_props: {
	params: Pick<DashboardCountryReportPageProps["params"], "locale">;
}): Promise<Array<Pick<DashboardCountryReportPageProps["params"], "code" | "year">>> {
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

	const { locale } = params;
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

	const { locale } = params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardCountryReportPage");

	await assertAuthenticated();

	const result = dashboardCountryReportPageParams.safeParse(params);
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
