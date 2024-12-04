import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface DocumentationPageProps {
	params: Promise<{
		id: string;
		locale: Locale;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Promise<Pick<Awaited<DocumentationPageProps["params"]>, "locale">>;
}): Promise<Array<Pick<Awaited<DocumentationPageProps["params"]>, "id">>> {
	const { params } = props;

	const { locale } = await params;

	const ids = await createCollectionResource("documentation", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<DocumentationPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { id: _id, locale } = await params;
	const id = decodeURIComponent(_id);

	const entry = await createCollectionResource("documentation", locale).read(id);
	const { title } = entry.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function DocumentationPage(
	props: Readonly<DocumentationPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { id: _id, locale } = await params;
	const id = decodeURIComponent(_id);

	setRequestLocale(locale);

	const entry = await createCollectionResource("documentation", locale).read(id);
	const { content, title } = entry.data;
	const { default: Content } = await entry.compile(content);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{title}
					</h1>
					{/* <p className="font-heading text-small text-text-weak xs:text-heading-4">{lead}</p> */}
				</div>
			</section>

			<section className="layout-subgrid typography content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<Content />
			</section>
		</MainContent>
	);
}