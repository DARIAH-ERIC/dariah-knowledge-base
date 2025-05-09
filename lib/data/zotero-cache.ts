import { db } from "@/lib/db";

export function checkZoteroCache(url: URL, version: string) {
	return db.zoteroCache.findUnique({
		where: {
			url: url.toString(),
			lastModifiedVersion: version,
		},
	});
}

export function updateZoteroCache(url: URL, version: string) {
	return db.zoteroCache.upsert({
		where: {
			url: url.toString(),
		},
		update: {
			lastModifiedVersion: version,
		},
		create: {
			url: url.toString(),
			lastModifiedVersion: version,
		},
	});
}
