import type { ImageResponse } from "next/og";

import { MetadataImage } from "@/components/metadata-image";
import type { IntlLocale } from "@/lib/i18n/locales";
import { getMetadata } from "@/lib/i18n/metadata";

export const runtime = "edge";

// export const alt = ''

export const size = {
	width: 1200,
	height: 630,
};

interface OpenGraphImageProps {
	params: {
		locale: IntlLocale;
	};
}

export default async function OpenGraphImage(props: OpenGraphImageProps): Promise<ImageResponse> {
	const { params } = props;

	const { locale } = params;
	const meta = await getMetadata(locale);

	const title = meta.title;

	return MetadataImage({ locale, size, title });
}
