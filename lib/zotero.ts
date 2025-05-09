import { createUrl, createUrlSearchParams, keyByToMap, request } from "@acdh-oeaw/lib";
import { revalidateTag } from "next/cache";

import { groupId } from "@/config/zotero.config";
import { createBibliography } from "@/lib/create-bibliography";
import { checkZoteroCache, updateZoteroCache } from "@/lib/data/zotero-cache";
import { parseLinkHeader } from "@/lib/parse-link-header";

export interface ZoteroCollection {
	key: string;
	version: number;
	library: {
		type: string;
		id: number;
		name: string;
	};
	data: {
		key: string;
		version: number;
		name: string;
	};
}

/** In CSL-JSON format. */
export interface ZoteroItem {
	id: string;
	type: string;
	issued: {
		/** Even though CSL-JSON requires date parts to be numbers, the zotero api can also return strings. */
		"date-parts": [
			| [number | string]
			| [number | string, number | string]
			| [number | string, number | string, number | string],
		];
	};
}

const baseUrl = "https://api.zotero.org";
const headers = {
	Accept: "application/json",
	"Zotero-API-Version": "3",
};

export function createZoteroCollectionUrl() {
	const url = createUrl({
		baseUrl,
		pathname: `/groups/${String(groupId)}/collections`,
	});

	return url;
}

export async function getCollectionsByCountryCode() {
	const url = createUrl({
		baseUrl,
		pathname: `/groups/${String(groupId)}/collections`,
		searchParams: createUrlSearchParams({
			limit: 50,
		}),
	});

	const collections = (await request(url, {
		headers,
		responseType: "json",
	})) as Array<ZoteroCollection>;

	const collectionsByCountryCode = keyByToMap(collections, (collection) => {
		return collection.data.name.toLowerCase();
	});

	return collectionsByCountryCode;
}

export async function getCollectionItems(id: string) {
	let url: URL | string | undefined = createUrl({
		baseUrl,
		pathname: `/groups/${String(groupId)}/collections/${id}/items`,
		searchParams: createUrlSearchParams({
			format: "csljson",
			/** Exclude notes. */
			itemType: "-note",
			limit: 50,
		}),
	});

	const data: Array<ZoteroItem> = [];

	const collectionHasChanged = await checkCollectionVersion(url);

	if (collectionHasChanged) {
		revalidateTag("zotero");
	}

	do {
		const response = await fetch(url, {
			headers,
			cache: "force-cache",
			next: { tags: ["zotero"] },
		});
		const { items } = (await response.json()) as { items: Array<ZoteroItem> };

		data.push(...items);

		/**
		 * Zotero returns pagination information in link header.
		 *
		 * @see https://www.zotero.org/support/dev/web_api/v3/basics#sorting_and_pagination
		 */
		const links = parseLinkHeader(response.headers.get("link"));

		url = "next" in links ? links.next : undefined;
	} while (url != null);

	return data;
}

export async function checkCollectionVersion(url: URL) {
	const response = await fetch(url, { headers });
	const lastModifiedVersion = response.headers.get("last-modified-version");
	const cachedItem = await checkZoteroCache(url, lastModifiedVersion!);
	const collectionHasChanged = Boolean(!cachedItem);
	if (collectionHasChanged) {
		await updateZoteroCache(url, lastModifiedVersion!);
	}
	return collectionHasChanged;
}

interface GetPublicationsParams {
	countryCode: string;
	year: number;
}

export async function getPublications(params: GetPublicationsParams) {
	const { countryCode, year } = params;

	const collectionsByCountryCode = await getCollectionsByCountryCode();
	const collection = collectionsByCountryCode.get(countryCode);
	const items = collection != null ? await getCollectionItems(collection.key) : [];

	const publications = items.filter((item) => {
		/**
		 * Filter publications by publication year client-side, because the zotero api does
		 * not allow that.
		 */
		try {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (Number(item.issued?.["date-parts"]?.[0]?.[0]) === year) return true;
			return false;
		} catch {
			return false;
		}
	});

	/**
	 * We format citations outselves instead of requesting formatted html from the
	 * zotero api via `?include=bib,data`, because the zotero api is dead slow
	 * and this makes it even slower, i.e. it increases the chance of timeout errors
	 * substantially.
	 */
	const bibliography = createBibliography(publications);

	return { bibliography, items: publications };
}
