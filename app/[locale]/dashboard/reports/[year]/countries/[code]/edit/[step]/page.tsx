import { assert } from "@acdh-oeaw/lib";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AppLink } from "@/components/app-link";
import { FormDescription } from "@/components/form-description";
import { FormTitle } from "@/components/form-title";
import { ConfirmationForm } from "@/components/forms/confirmation-form";
import { ContributionsForm } from "@/components/forms/contributions-form";
import { EventReportForm } from "@/components/forms/event-report-form";
import { InstitutionsForm } from "@/components/forms/institutions-form";
import { OutreachReportsForm } from "@/components/forms/outreach-reports-form";
import { ProjectsFundingLeveragesForm } from "@/components/forms/projects-funding-leverages-form";
import { PublicationsForm } from "@/components/forms/publications-form";
import { ReportSummary } from "@/components/forms/report-summary";
import { ServiceReportsForm } from "@/components/forms/service-reports-form";
import { SoftwareForm } from "@/components/forms/software-form";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { Locale } from "@/config/i18n.config";
import { getCurrentUser } from "@/lib/auth/session";
import { createHref } from "@/lib/create-href";
import { getCountryByCode, getCountryCodes as _getCountryCodes } from "@/lib/data/country";
import { getReportByCountryCode } from "@/lib/data/report";
import { getCountryCodes as getStaticCountryCodes } from "@/lib/get-country-codes";
import { redirect } from "@/lib/navigation";
import {
	type DashboardCountryReportEditStepPageParams,
	dashboardCountryReportEditStepPageParams,
	dashboardCountryReportSteps,
} from "@/lib/schemas/dashboard";
import { reportCommentsSchema } from "@/lib/schemas/report";

interface DashboardCountryReportEditStepPageProps {
	params: {
		code: string;
		locale: Locale;
		step: string;
		year: string;
	};
}

export const dynamicParams = false;

export async function generateStaticParams(_props: {
	params: Pick<DashboardCountryReportEditStepPageProps["params"], "locale">;
}): Promise<Array<Pick<DashboardCountryReportEditStepPageProps["params"], "code" | "step">>> {
	/**
	 * FIXME: we cannot access the postgres database on acdh servers from github ci/cd, so we cannot
	 * query for country codes at build time.
	 */
	// const countries = await getCountryCodes();
	const countries = await Promise.resolve(Array.from(getStaticCountryCodes().values()));

	const steps = dashboardCountryReportSteps;

	const params = countries.flatMap((code) => {
		return steps.map((step) => {
			return { code, step };
		});
	});

	return params;
}

export async function generateMetadata(
	props: DashboardCountryReportEditStepPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const t = await getTranslations({ locale, namespace: "DashboardCountryReportEditStepPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default function DashboardCountryReportEditStepPage(
	props: DashboardCountryReportEditStepPageProps,
): ReactNode {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const t = useTranslations("DashboardCountryReportEditStepPage");

	const result = dashboardCountryReportEditStepPageParams.safeParse(params);
	if (!result.success) notFound();
	const { code, step, year } = result.data;

	return (
		<MainContent className="container grid content-start gap-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<DashboardCountryReportEditStepPageContent code={code} step={step} year={year} />
		</MainContent>
	);
}

interface DashboardCountryReportEditStepPageContentProps
	extends DashboardCountryReportEditStepPageParams {}

async function DashboardCountryReportEditStepPageContent(
	props: DashboardCountryReportEditStepPageContentProps,
) {
	const { code, step, year } = props;

	const t = await getTranslations("DashboardCountryReportEditStepPageContent");

	const user = await getCurrentUser();

	if (user == null) {
		redirect("/");
		/** FIXME: @see https://github.com/amannn/next-intl/issues/823 */
		assert(false);
	}

	const country = await getCountryByCode({ code });
	if (country == null) notFound();

	const report = await getReportByCountryCode({ countryCode: code, year });
	if (report == null) notFound();

	// TODO: safeParse
	const comments = report.comments != null ? reportCommentsSchema.parse(report.comments) : null;

	const previousReport = await getReportByCountryCode({ countryCode: code, year: year - 1 });

	switch (step) {
		case "confirm": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("confirm-information")}</FormTitle>
					<FormDescription>
						Tempor aliqua non ad sint sint officia Lorem cupidatat cillum sint non tempor quis qui.
						Voluptate sunt cillum et do cillum ut deserunt aliqua nisi pariatur velit adipisicing
						sint. Incididunt laboris tempor cupidatat tempor laborum nulla consectetur consectetur
						exercitation tempor veniam ullamco ullamco commodo. Nulla commodo ad dolor laboris nulla
						tempor labore.
					</FormDescription>

					<ConfirmationForm countryId={country.id} reportId={report.id} />

					<Navigation code={code} next="summary" previous="project-funding-leverage" year={year} />
				</section>
			);
		}

		case "contributions": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("contributions")}</FormTitle>
					<FormDescription>
						<p>
							Here we want to capture the estimated number of individuals contributing to DARIAH
							within the national node. You should include anyone who participates regularly in
							national DARIAH events, contributes to national initiatives or projects, acts as a
							contact point within an institution, receives national or institutional funding linked
							to DARIAH in your country. Categories that might be applicable in your country:
						</p>

						<ol>
							<li>At least one person per partner institution</li>
							<li>Anyone directly paid or funded by the a national DARIAH (or CLARIAH) project</li>
							<li>People on &quot;DARIAH-affiliated projects&quot; (humanities infrastructure)</li>
							<li>People&apos;s whose work is submitted as DARIAH in kind contribution</li>
							<li>
								People making contribution but who are not paid (running DARIAH-relevant events)
							</li>
						</ol>

						<p>
							This response will consist of a single number. If you estimate, please let us know the
							basis for your estimate, using the comment section.
						</p>
					</FormDescription>

					<ContributionsForm
						comments={comments}
						contributionsCount={report.contributionsCount}
						countryId={country.id}
						reportId={report.id}
						year={year}
					/>

					<Navigation code={code} next="events" previous="institutions" year={year} />
				</section>
			);
		}

		case "events": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("events")}</FormTitle>
					<FormDescription>
						<p>This response will consist of three numbers:</p>

						<ul>
							<li>number of large meetings (more than 50 people in attendance),</li>
							<li>number of medium sized meetings (20 to 50 people) and</li>
							<li>number of small meetings (less than 20 people).</li>
						</ul>

						<p>
							Any events held at the national level that contribute to DARIAH in your country should
							be counted. This includes presentations about DARIAH to raise awareness of it and its
							activities, or workshops and conferences dedicated to DARIAH. Please take into account
							both face-to-face and virtual meetings. Note that the number you provide will be used
							to help determine your in-kind contributions as well.
						</p>

						<h3>DARIAH Commissioned Event</h3>

						<p>
							These are big, international events that are commissioned by DARIAH and serve to
							fulfill a strategic interest. Examples include the Annual Event or the DARIAH
							Innovation Forum. DARIAH staff will fill this section out for you, if relevant.
						</p>
					</FormDescription>

					<EventReportForm
						comments={comments}
						previousReportId={previousReport?.id}
						reportId={report.id}
					/>

					<Navigation code={code} next="outreach" previous="contributions" year={year} />
				</section>
			);
		}

		case "institutions": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("institutions")}</FormTitle>
					<FormDescription>
						<p>
							This response will consist of a single number and a list of your Partner Institutions
							(including your National Coordinating Institution). Please verify that the information
							below is up-to-date. If not, please give any corrections needed here. This list will
							be used to update the DARIAH website &quot;members and partners&quot; section.
						</p>
					</FormDescription>

					<InstitutionsForm
						comments={comments}
						countryId={country.id}
						reportId={report.id}
						year={year}
					/>

					<Navigation code={code} next="contributions" previous="welcome" year={year} />
				</section>
			);
		}

		case "outreach": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("outreach")}</FormTitle>
					<FormDescription>
						<p>
							It is important for DARIAH-EU to keep track of outreach statistics. Please give us the
							number of page impressions for any national DARIAH website that you may have, as well
							as the number of users and posts for your various social media accounts (Twitter,
							LinkedIn, Youtube, Facebook, etc.)
						</p>
					</FormDescription>

					<OutreachReportsForm
						comments={comments}
						countryId={country.id}
						previousReportId={previousReport?.id}
						reportId={report.id}
					/>

					<Navigation code={code} next="services" previous="events" year={year} />
				</section>
			);
		}

		case "project-funding-leverage": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("project-funding-leverage")}</FormTitle>
					<FormDescription>
						<p>
							Please report the overall amount in Euros of any grant funding awarded to or within
							the DARIAH national consortium that is directly or indirectly related to DARIAH
							activities. Do not include funding from DARIAH itself (such as DARIAH Theme or Working
							Group funding).
						</p>
					</FormDescription>

					<ProjectsFundingLeveragesForm
						comments={comments}
						previousReportId={previousReport?.id}
						reportId={report.id}
					/>

					<Navigation code={code} next="confirm" previous="publications" year={year} />
				</section>
			);
		}

		case "publications": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("publications")}</FormTitle>
					<FormDescription>
						<p>
							The DARIAH definition of a publication is a significant and durable, accessible
							contribution to knowledge. A publication counts as DARIAH-affiliated when:
						</p>

						<ul>
							<li>
								it resulted from work in the national consortium; funded by either DARIAH-EU or your
								national funding for DARIAHs/ CLARIAH
							</li>
							<li>a DARIAH-affiliated tool or resource is cited in them;</li>
							<li>it is about DARIAH/CLARIAH or</li>
							<li>it is written by authors affiliated to DARIAH bodies or national DARIAHs.</li>
						</ul>

						<p>
							They may be peer reviewed publications, or they may be reports, working papers,
							pre-prints, major releases of training material or even substantive blog posts.
							Importantly, please also include DOIs or other Persistent Identifiers (handles, HAL
							IDs etc.) when reporting the bibliographical entries.
						</p>

						<p>
							You also do not need to report items deposited into DARIAH-EU HAL or Zenodo
							collections, as these are already automatically gathered.
						</p>

						<p>
							To add your publications, please do so in your national folder of the DARIAH Zotero
							Group Library following the Guidelines.
						</p>
					</FormDescription>

					<PublicationsForm
						comments={comments}
						countryCode={code}
						reportId={report.id}
						year={year}
					/>

					<Navigation code={code} next="project-funding-leverage" previous="software" year={year} />
				</section>
			);
		}

		// case "research-policy-developments": {
		// 	return (
		// 		<section className="grid gap-6">
		// 			<FormTitle>{t("research-policy-developments")}</FormTitle>
		// 			<FormDescription>
		// 				Tempor aliqua non ad sint sint officia Lorem cupidatat cillum sint non tempor quis qui.
		// 				Voluptate sunt cillum et do cillum ut deserunt aliqua nisi pariatur velit adipisicing
		// 				sint. Incididunt laboris tempor cupidatat tempor laborum nulla consectetur consectetur
		// 				exercitation tempor veniam ullamco ullamco commodo. Nulla commodo ad dolor laboris nulla
		// 				tempor labore.
		// 			</FormDescription>

		// 			<ResearchPolicyDevelopmentsForm
		// 				comments={comments}
		// 				previousReportId={previousReport?.id}
		// 				reportId={report.id}
		// 			/>
		// 		</section>
		// 	);
		// }

		case "services": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("services")}</FormTitle>
					<FormDescription>
						<p>
							As a virtual digital research infrastructure, a large amount of service access takes
							place over web-based platforms. This indicator attempts to capture the audience and
							usage of DARIAH&apos;s national services.
						</p>

						<p>
							Services in this list are the ones including in your national catalogue, as{" "}
							<a href="https://marketplace.sshopencloud.eu/search?f.keyword=DARIAH+Resource">
								maintained in the SSH Open Marketplace
							</a>
							, and displayed on the{" "}
							<a href="https://www.dariah.eu/tools-services/tools-and-services/">
								DARIAH service catalogue
							</a>
							. If you want to update the list, please refer to{" "}
							<a href="https://drive.google.com/file/d/10tGdjKY8XC3TkNnVD_svl9_VrPoWTBWw/view">
								these guidelines
							</a>
							.
						</p>

						<p>
							Please note that if you are adding resources to the Marketplace, they may not
							immediately appear in this tool. If this is the case, once you have made additions, or
							if you have any questions, please contact the UNR team.
						</p>
					</FormDescription>

					<ServiceReportsForm
						comments={comments}
						countryId={country.id}
						previousReportId={previousReport?.id}
						reportId={report.id}
						year={year}
					/>

					<Navigation code={code} next="software" previous="outreach" year={year} />
				</section>
			);
		}

		case "software": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("software")}</FormTitle>
					<FormDescription>
						<p>
							List here any software/code of a specialized application that has been or is being
							developed within your consortium and is made available under a permissive license for
							reuse. Examples of software is any code made available through github (e.g.{" "}
							<a href="https://github.com/acdh-oeaw/OpenAtlas">
								https://github.com/acdh-oeaw/OpenAtlas
							</a>
							).
						</p>

						<p>
							In distinction to services, which are available as web applications or APIs and can be
							used directly, software needs to be downloaded and installed or executed on the side
							of the user, to be used. The contribution should include the source code (and must be
							documented as well, not just orphan code). The code can be in any programming
							language, it can also be only a simple script dedicated to one specific task, as long
							as it is working and documented.
						</p>
					</FormDescription>

					<SoftwareForm comments={comments} countryId={country.id} reportId={report.id} />

					<Navigation code={code} next="publications" previous="services" year={year} />
				</section>
			);
		}

		case "summary": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("summary")}</FormTitle>
					<FormDescription>
						<p>
							Every DARIAH Member country must reach a certain threshold of contributions, set by
							the DARIAH General Assembly. In the past, we asked National Coordinators to calculate
							these sums by themselves. However, in line with the requests from National
							Coordinators and the ongoing reforms to contributions, we have decided to offer
							guidelines that allow In-Kind Contributions to be automatically calculated, following
							input to the Unified National Report.
						</p>

						<p>
							You have two options - either you have already calculated your total in-kind
							contributions for your own purposes, or you can have us calculate them for you based
							on the information reported in this Unified National Report. For further information,
							please read the{" "}
							<a href="https://docs.google.com/document/d/1A482x5XHwOsEZlmOcn5hw7lHy9muKMfeNs_T5BzQ4II/edit">
								Policy on the financial value of DARIAH services and other IKCs
							</a>{" "}
							which explains two options:
						</p>
					</FormDescription>

					<ReportSummary countryId={country.id} reportId={report.id} />
				</section>
			);
		}

		case "welcome": {
			return (
				<section className="grid gap-6">
					<FormTitle>{t("welcome")}</FormTitle>
					<FormDescription>
						<p>
							Thank you in advance for your assistance in helping us to quantify and describe richly
							some of the key aspects of DARIAH&apos;s operations as a distributed research
							infrastructure. If you have any questions about what should be reported or how, please
							do not hesitate to ask via{" "}
							<Link href={createHref({ pathname: "/contact" })}>our contact form</Link>.
						</p>
					</FormDescription>

					<Navigation code={code} next="institutions" year={year} />
				</section>
			);
		}

		default: {
			notFound();
		}
	}
}

interface NavigationProps {
	code: string;
	next?: DashboardCountryReportEditStepPageParams["step"];
	previous?: DashboardCountryReportEditStepPageParams["step"];
	year: number;
}

function Navigation(props: NavigationProps): ReactNode {
	const { code, next, previous, year } = props;

	const t = useTranslations("DashboardCountryReportEditStepNavigation");

	if (previous == null && next == null) return null;

	return (
		<div className="flex items-center gap-x-8 py-8">
			{previous != null ? (
				<AppLink
					className="mr-auto gap-x-2 font-medium"
					href={createHref({
						pathname: `/dashboard/reports/${year}/countries/${code}/edit/${previous}`,
					})}
				>
					<ChevronLeftIcon aria-hidden={true} className="size-4 shrink-0" />
					{t("previous")}
				</AppLink>
			) : null}
			{next != null ? (
				<AppLink
					className="ml-auto gap-x-2 font-medium"
					href={createHref({
						pathname: `/dashboard/reports/${year}/countries/${code}/edit/${next}`,
					})}
				>
					{t("next")}
					<ChevronRightIcon aria-hidden={true} className="size-4 shrink-0" />
				</AppLink>
			) : null}
		</div>
	);
}
