import { db } from "@/lib/db";

interface GetReportsByYearParams {
	year: number;
}

export function getReportsByYear(params: GetReportsByYearParams) {
	const { year } = params;

	return db.report.findMany({
		where: {
			year,
		},
		include: {
			eventReport: true,
			outreachReports: {
				include: {
					kpis: true,
					outreach: true,
				},
			},
			serviceReports: {
				include: {
					kpis: true,
					service: true,
				},
			},
		},
	});
}

interface GetServicesCountParams {
	year: number;
}

export function getServicesCount(params: GetServicesCountParams) {
	const { year: _year } = params;

	return db.service.groupBy({
		by: "status",
		_count: true,
	});
}

interface GetOutreachCountParams {
	year: number;
}

export function getOutreachCount(params: GetOutreachCountParams) {
	const { year } = params;

	return db.outreach.groupBy({
		// FIXME: how strict should we treat null dates?
		where: {
			OR: [
				{
					startDate: null,
				},
				{ startDate: { lte: new Date(Date.UTC(year, 11, 31)) } },
			],
			AND: {
				OR: [
					{
						endDate: null,
					},
					{
						endDate: { gte: new Date(Date.UTC(year, 0, 1)) },
					},
				],
			},
		},
		by: "type",
		_count: true,
	});
}

interface GetProjectFundingLeveragesParams {
	year: number;
}

export async function getProjectFundingLeverages(params: GetProjectFundingLeveragesParams) {
	const { year } = params;

	const first = new Date(Date.UTC(year, 0, 1)).getTime();
	const last = new Date(Date.UTC(year, 11, 31)).getTime();

	const all = await db.projectsFundingLeverage.findMany({
		where: {
			startDate: { not: null },
			projectMonths: { not: null },
			amount: { not: null },
		},
		select: {
			amount: true,
			projectMonths: true,
			startDate: true,
		},
	});

	const current = all.map((entry) => {
		if (entry.startDate == null) return 0;
		if (entry.projectMonths == null) return 0;
		if (entry.amount == null) return 0;

		const startDate = entry.startDate;
		const duration = entry.projectMonths;
		const amount = entry.amount.toNumber();

		const month = entry.startDate.getMonth();
		const endDate = new Date(startDate);
		endDate.setMonth(month + duration);

		if (endDate.getTime() < first) {
			return 0;
		}

		if (endDate.getTime() > last) {
			return amount * (12 / duration);
		}

		return amount * (endDate.getMonth() / duration);
	});

	return current.reduce((acc, i) => {
		return acc + i;
	}, 0);
}

interface GetInstitutionsCountParams {
	year: number;
}

export async function getInstitutionsCount(params: GetInstitutionsCountParams) {
	const { year } = params;

	// TODO: how to groupBy on array fields in prisma?
	const institutions = await db.institution.findMany({
		// FIXME: how strict should we treat null dates?
		where: {
			OR: [
				{
					startDate: null,
				},
				{ startDate: { lte: new Date(Date.UTC(year, 11, 31)) } },
			],
			AND: {
				OR: [
					{
						endDate: null,
					},
					{
						endDate: { gte: new Date(Date.UTC(year, 0, 1)) },
					},
				],
			},
		},
	});

	const byType: Record<string, number> = {};

	institutions.forEach((institution) => {
		institution.types.forEach((type) => {
			byType[type] ??= 0;
			byType[type]++;
		});
	});

	return byType;
}

interface GetContributionsCountParams {
	year: number;
}

export async function getContributionsCount(params: GetContributionsCountParams) {
	const { year } = params;

	const contributions = await db.contribution.findMany({
		// FIXME: how strict should we treat null dates?
		where: {
			OR: [
				{
					startDate: null,
				},
				{ startDate: { lte: new Date(Date.UTC(year, 11, 31)) } },
			],
			AND: {
				OR: [
					{
						endDate: null,
					},
					{
						endDate: { gte: new Date(Date.UTC(year, 0, 1)) },
					},
				],
			},
		},
		select: {
			role: {
				select: {
					name: true,
				},
			},
		},
	});

	const byRole: Record<string, number> = {};

	contributions.forEach((contribution) => {
		const role = contribution.role.name;
		byRole[role] ??= 0;
		byRole[role]++;
	});

	return byRole;
}
