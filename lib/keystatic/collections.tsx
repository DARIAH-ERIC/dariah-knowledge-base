import {
	createAssetOptions,
	createCollection,
	createContentFieldOptions,
	createLabel,
} from "@acdh-oeaw/keystatic-lib";
import { collection, fields } from "@keystatic/core";

import {
	createDisclosure,
	createEmbed,
	createFigure,
	createFootnote,
	createGrid,
	createHeadingId,
	createLink,
	createTabs,
	createVideo,
} from "@/lib/keystatic/components";
import { createPreviewUrl } from "@/lib/keystatic/create-preview-url";

export const createDocumentation = createCollection("/documentation/", (paths, locale) => {
	return collection({
		label: createLabel("Documentation", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/documentation/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			content: fields.mdx({
				label: "Content",
				options: createContentFieldOptions(paths.assetPath),
				components: {
					...createDisclosure(paths.assetPath, locale),
					...createEmbed(paths.assetPath, locale),
					...createFigure(paths.assetPath, locale),
					...createFootnote(paths.assetPath, locale),
					...createGrid(paths.assetPath, locale),
					...createHeadingId(paths.assetPath, locale),
					...createLink(paths.assetPath, locale),
					...createTabs(paths.assetPath, locale),
					...createVideo(paths.assetPath, locale),
				},
			}),
		},
	});
});