import type { Country } from "@prisma/client";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageLeadIn } from "@/components/page-lead-in";
import { PageTitle } from "@/components/page-title";
import { SubmitButton } from "@/components/submit-button";
import { LinkButton } from "@/components/ui/link-button";
import { getCountryById } from "@/lib/data/country";
import { createReportForCountryId, getReportByCountryId } from "@/lib/data/report";
import type { IntlLocale } from "@/lib/i18n/locales";
import { createHref } from "@/lib/navigation/create-href";
import { redirect } from "@/lib/navigation/navigation";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface DashboardPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: DashboardPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "DashboardPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardPage(props: DashboardPageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("DashboardPage");

	const { user } = await assertAuthenticated();

	const year = new Date().getUTCFullYear() - 1;
	const { countryId } = user;

	if (countryId == null) {
		notFound();
	}

	const country = await getCountryById({ id: countryId });

	if (country == null) {
		notFound();
	}

	return (
		<MainContent className="container grid content-start gap-y-4 py-8">
			<PageTitle>{t("title")}</PageTitle>
			{/* <PageLeadIn>{t("lead-in")}</PageLeadIn> */}
			<PageLeadIn>
				<p>
					Welcome to the DARIAH National Coordinator Dashboard! This is where you will complete your
					annual reporting for the Unified National Reports. The information requested is the same
					as previous years, and this new format will allow us to create a better integration of
					data from one year to the next.
				</p>

				<p>
					You may complete the UNR over several sessions, just make sure to save. As well, multiple
					users can be logged in and contribute, though please keep in mind that there is no dynamic
					saving here - if two of your staff members are working simultaneously, the most recent
					save will overwrite the other.
				</p>

				<p>
					If at any point you have questions, don&apos;t hesitate to reach out to your DCO helper or
					the UNR email alias.
				</p>
			</PageLeadIn>

			<DashboardPageContent country={country} year={year} />
		</MainContent>
	);
}

interface DashboardPageContentProps {
	country: Country;
	year: number;
}

async function DashboardPageContent(props: DashboardPageContentProps) {
	const { country, year } = props;

	const locale = await getLocale();
	const t = await getTranslations("DashboardPageContent");

	const report = await getReportByCountryId({ countryId: country.id, year });

	return (
		<div className="my-2">
			{report == null ? (
				<form
					action={async () => {
						"use server";

						await createReportForCountryId({ countryId: country.id, year });

						redirect({
							href: createHref({
								pathname: `/dashboard/reports/${String(year)}/countries/${country.code}/edit/welcome`,
							}),
							locale,
						});
					}}
				>
					<SubmitButton>{t("create-page-for-year", { year: String(year) })}</SubmitButton>
				</form>
			) : (
				<LinkButton
					href={createHref({
						pathname: `/dashboard/reports/${String(year)}/countries/${country.code}/edit/welcome`,
					})}
				>
					{t("edit-page-for-year", { year: String(year) })}
				</LinkButton>
			)}
		</div>
	);
}
