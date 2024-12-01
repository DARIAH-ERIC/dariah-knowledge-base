import { createAssetOptions, withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { fields } from "@keystatic/core";

import type { Locale } from "@/config/i18n.config";

export function createLinkSchema(assetPath: `/${string}/`, locale: Locale) {
	return fields.conditional(
		fields.select({
			label: "Kind",
			options: [
				{ label: "Documentation", value: "documentation" },
				{ label: "Download", value: "download" },
				{ label: "External", value: "external" },
			],
			defaultValue: "external",
		}),
		{
			documentation: fields.relationship({
				label: "Documentation",
				validation: { isRequired: true },
				collection: withI18nPrefix("documentation", locale),
			}),
			download: fields.file({
				label: "Download",
				validation: { isRequired: true },
				...createAssetOptions(assetPath),
			}),
			external: fields.url({
				label: "URL",
				validation: { isRequired: true },
			}),
		},
	)
}
