import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { DraftModeToggle } from "@/components/draft-mode-toggle";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { getDocumentationContent } from "@/lib/content/mdx";
import { reader } from "@/lib/content/reader";
import type { IntlLocale } from "@/lib/i18n/locales";

interface DocumentationPageProps {
	params: Promise<{
		id: string;
		locale: IntlLocale;
	}>;
}

// export const dynamicParams = false;

export async function generateStaticParams(_props: {
	params: Pick<Awaited<DocumentationPageProps["params"]>, "locale">;
}): Promise<Array<Pick<Awaited<DocumentationPageProps["params"]>, "id">>> {
	const ids = await (await reader()).collections.documentation.list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: DocumentationPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { id } = await params;
	const document = await (await reader()).collections.documentation.read(id);

	if (document == null) notFound();

	const metadata: Metadata = {
		title: document.title,
	};

	return metadata;
}

export default async function DocumentationPage(props: DocumentationPageProps): Promise<ReactNode> {
	const { params } = props;

	const { id, locale } = await params;
	setRequestLocale(locale);

	return (
		<MainContent className="container py-8">
			<DraftModeToggle />

			<DocumentationPageContent id={id} locale={locale} />
		</MainContent>
	);
}

interface DocumentationPageContentProps {
	id: string;
	locale: IntlLocale;
}

async function DocumentationPageContent(props: DocumentationPageContentProps) {
	const { id } = props;

	const document = await (await reader()).collections.documentation.read(id);
	if (document == null) notFound();

	const { Content } = await getDocumentationContent(id);

	return (
		<div className="mx-auto grid w-full max-w-(--breakpoint-md) content-start gap-y-8">
			<PageTitle>{document.title}</PageTitle>

			<div className="prose prose-sm">
				<Content />
			</div>
		</div>
	);
}
