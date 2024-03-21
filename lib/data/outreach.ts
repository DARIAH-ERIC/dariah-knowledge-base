import type { Country } from "@prisma/client";

import { db } from "@/lib/db";

interface GetOutreachByCountryParams {
	countryId: Country["id"];
}

export function getOutreachByCountry(params: GetOutreachByCountryParams) {
	const { countryId } = params;

	return db.outreach.findMany({
		where: {
			country: {
				id: countryId,
			},
			endDate: null,
		},
		orderBy: {
			name: "asc",
		},
	});
}

interface GetOutreachUrlsByCountryParams {
	countryId: Country["id"];
}

export function getOutreachUrlsByCountry(params: GetOutreachUrlsByCountryParams) {
	const { countryId } = params;

	return db.outreach.findMany({
		where: {
			country: {
				id: countryId,
			},
			endDate: null,
		},
		orderBy: {
			name: "asc",
		},
		select: {
			type: true,
			url: true,
		},
	});
}

interface GetSocialMediaByCountryParams {
	countryId: Country["id"];
}

export function getSocialMediaByCountry(params: GetSocialMediaByCountryParams) {
	const { countryId } = params;

	return db.outreach.findMany({
		where: {
			country: {
				id: countryId,
			},
			endDate: null,
			type: "social_media",
		},
		orderBy: {
			name: "asc",
		},
		select: {
			url: true,
		},
	});
}
