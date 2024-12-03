import { cn } from "@acdh-oeaw/style-variants";
import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { Logo } from "@/components/logo";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";

interface IndexPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<IndexPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const _t = await getTranslations({ locale, namespace: "IndexPage" });

	const metadata: Metadata = {
		/**
		 * Fall back to `title.default` from `layout.tsx`.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#title
		 */
		// title: undefined,
	};

	return metadata;
}

export default async function IndexPage(props: Readonly<IndexPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<MainContent className="layout-grid content-start">
			<HeroSection />
		</MainContent>
	);
}

function HeroSection(): ReactNode {
	const t = useTranslations("IndexPage");

	return (
		<section className="layout-subgrid relative gap-y-10 bg-fill-weaker py-16 xs:py-24">
			<div className="max-w-text grid gap-y-6">
				<span className="inline-flex items-center gap-x-2 justify-self-start rounded-4 border border-stroke-weak bg-fill-weak px-3 py-0.5 text-tiny text-text-strong">
					<Logo className="size-5 shrink-0 text-icon-neutral" />
					<span>{t("badge")}</span>
				</span>
				<h1 className="text-balance font-heading text-display font-strong text-text-strong">
					{t("title")}
				</h1>
				<p className="font-heading text-small text-text-weak xs:text-heading-4">{t("lead-in")}</p>
				<div className="flex items-center gap-x-4">
					<Link
						className={cn(
							"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-6 py-2.5 font-strong text-text-inverse-strong shadow-raised",
							"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
						)}
						href={createHref({ pathname: "/dashboard" })}
					>
						{t("links.dashboard")}
					</Link>
					<Link
						className={cn(
							"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong px-6 py-2.5 font-strong text-text-brand shadow-raised",
							"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
						)}
						href={createHref({ pathname: "/documentation" })}
					>
						{t("links.documentation")}
					</Link>
				</div>
			</div>
		</section>
	);
}
