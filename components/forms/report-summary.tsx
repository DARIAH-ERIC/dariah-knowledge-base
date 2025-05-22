import type { Country, Report } from "@prisma/client";
import { getFormatter } from "next-intl/server";

import { Confetti } from "@/components/confetti";
import { Summary } from "@/components/forms/summary";
import { Link } from "@/components/link";
import { ReportDownloadLink } from "@/components/report-download-link";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateOperationalCost } from "@/lib/calculate-operational-cost";
import { createHref } from "@/lib/create-href";
import { getContributionsByCountryAndYear } from "@/lib/data/contributions";
import { getCountyCodeByCountyId } from "@/lib/data/country";
import { getPartnerInstitutionsByCountry } from "@/lib/data/institution";
import { getOutreachByCountry } from "@/lib/data/outreach";
import {
	getOutreachReports,
	getProjectsFundingLeverages,
	getServiceReports,
} from "@/lib/data/report";
import { getServicesByCountry } from "@/lib/data/service";
import { getSoftwareByCountry } from "@/lib/data/software";
import { getPublications } from "@/lib/zotero";

interface ReportSummaryProps {
	countryId: Country["id"];
	reportId: Report["id"];
	year: number;
}

export async function ReportSummary(props: ReportSummaryProps) {
	const { countryId, reportId, year } = props;

	const user = await getCurrentUser();
	const { number } = await getFormatter();

	const calculation = await calculateOperationalCost({ countryId, reportId });

	const isAboveThreshold = calculation.operationalCost >= calculation.operationalCostThreshold;

	const [
		projectsFundingLeverages,
		softwares,
		countryCode,
		outreachs,
		outreachReports,
		services,
		serviceReports,
		contributions,
		institutions,
	] = await Promise.all([
		getProjectsFundingLeverages({ reportId }),
		getSoftwareByCountry({ countryId }),
		getCountyCodeByCountyId({ id: countryId }),
		getOutreachByCountry({ countryId }),
		getOutreachReports({ reportId }),
		getServicesByCountry({ countryId }),
		getServiceReports({ reportId }),
		getContributionsByCountryAndYear({ countryId, year }),
		getPartnerInstitutionsByCountry({ countryId }),
	]);

	const publications = await getPublications({ countryCode: countryCode!.code, year });

	const report = {
		contributors: {
			count: calculation.count.contributions,
			items: contributions.map((c) => {
				return { name: c.person.name, role: c.role.name };
			}),
		},
		events: {
			count: calculation.count.events,
		},
		institutions: {
			count: calculation.count.institutions,
			items: institutions.map((i) => {
				return { name: i.name };
			}),
		},
		operationalCost: {
			threshold: calculation.operationalCostThreshold,
			cost: calculation.operationalCost,
		},
		outreach: {
			count: outreachs.length,
			items: outreachs.map((o) => {
				return {
					name: o.name,
					type: o.type,
					kpi: outreachReports
						.filter((r) => {
							return r.outreachId === o.id;
						})
						.flatMap((r) => {
							return r.kpis.map((k) => {
								return { unit: k.unit, value: k.value };
							});
						}),
				};
			}),
		},
		projectFunding: {
			count: projectsFundingLeverages.length,
			items: projectsFundingLeverages.map((p) => {
				return {
					name: p.name,
					amount: p.amount,
					funders: p.funders,
					scope: p.scope,
					startDate: p.startDate?.toISOString().slice(0, 10),
					projectMonths: p.projectMonths,
				};
			}),
		},
		publications: {
			count: publications.items.length,
			items: publications.items,
		},
		services: {
			count: services.length,
			items: services.map((s) => {
				return {
					name: s.name,
					kpi: serviceReports
						.filter((r) => {
							return r.serviceId === s.id;
						})
						.flatMap((r) => {
							return r.kpis.map((k) => {
								return { unit: k.unit, value: k.value };
							});
						}),
				};
			}),
		},
		software: {
			count: softwares.length,
			items: softwares.map((s) => {
				return { name: s.name };
			}),
		},
	};

	return (
		<section className="grid gap-y-8">
			<Summary calculation={calculation} />

			<hr />

			<div className="grid gap-y-2 text-sm text-neutral-950 dark:text-neutral-0">
				<div>Financial value of the national in-kind contribution:</div>
				<div>
					Threshold:{" "}
					{number(Number(calculation.operationalCostThreshold), {
						style: "currency",
						currency: "EUR",
					})}
				</div>
				<div>
					Cost calculation:{" "}
					{number(Number(calculation.operationalCost), { style: "currency", currency: "EUR" })}
				</div>
			</div>

			<Confetti isEnabled={isAboveThreshold} />

			{!isAboveThreshold ? (
				<div>
					Using the Policy on InKind Financial Value calculations, you have not reached the
					threshold. This is not necessarily problematic, as you can report your own figures. Please
					get in touch with the DARIAH team via our{" "}
					<Link
						href={createHref({
							pathname: "/contact",
							searchParams: {
								email: user?.email,
								subject: "Operational cost calculation",
							},
						})}
					>
						contact form
					</Link>
					.
				</div>
			) : (
				<div>
					You have reached your financial in-kind threshold, congratulations! You have nothing
					further to do.
				</div>
			)}

			<div>
				<ReportDownloadLink calculation={report} />
			</div>
		</section>
	);
}
