import { pick } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { LocalizedStringProvider as Translations } from "react-aria-components/i18n";
import { jsonLdScriptProps } from "react-schemaorg";

import { Providers } from "@/app/[locale]/providers";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { AppLayout } from "@/components/app-layout";
import { id } from "@/components/main-content";
import { SkipLink } from "@/components/skip-link";
import { env } from "@/config/env.config";
import { AnalyticsScript } from "@/lib/analytics-script";
import { ColorSchemeScript } from "@/lib/color-scheme-script";
import * as fonts from "@/lib/fonts";
import { type IntlLocale, isValidLocale, locales } from "@/lib/i18n/locales";
import { getMetadata } from "@/lib/i18n/metadata";
import { cn } from "@/lib/styles";

interface LocaleLayoutProps {
	children: ReactNode;
	params: Promise<{
		locale: IntlLocale;
	}>;
}

// export const dynamicParams = false;

export function generateStaticParams(): Array<Awaited<LocaleLayoutProps["params"]>> {
	return locales.map((locale) => {
		return { locale };
	});
}

export async function generateMetadata(
	props: Omit<LocaleLayoutProps, "children">,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const meta = await getMetadata(locale);

	const metadata: Metadata = {
		title: {
			default: meta.title,
			template: ["%s", meta.title].join(" | "),
		},
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description,
			url: "./",
			siteName: meta.title,
			locale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			creator: meta.social.twitter,
			site: meta.social.twitter,
		},
		verification: {
			google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		},
	};

	return metadata;
}

export default async function LocaleLayout(props: LocaleLayoutProps): Promise<ReactNode> {
	const { children, params } = props;

	const { locale } = await params;

	if (!isValidLocale(locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const t = await getTranslations("LocaleLayout");
	const messages = await getMessages();
	const meta = await getMetadata();

	return (
		<html
			className={cn(fonts.body.variable)}
			lang={locale}
			/**
			 * Suppressing hydration warning because we add `data-ui-color-scheme` before first paint.
			 */
			suppressHydrationWarning={true}
		>
			<body>
				{/* @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld */}
				<script
					{...jsonLdScriptProps({
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: meta.title,
						description: meta.description,
					})}
				/>

				<ColorSchemeScript />

				{/**
				 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#optimizing-bundle-size
				 *
				 * TODO: only include translations for components actually used
				 *
				 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#advanced-optimization
				 */}
				<Translations locale={locale} />

				<Providers locale={locale} messages={pick(messages, ["Error"])}>
					<AnalyticsScript
						baseUrl={env.NEXT_PUBLIC_MATOMO_BASE_URL}
						id={env.NEXT_PUBLIC_MATOMO_ID}
					/>

					<SkipLink targetId={id}>{t("skip-to-main-content")}</SkipLink>

					<AppLayout>
						<AppHeader />
						{children}
						<AppFooter />
					</AppLayout>
				</Providers>
			</body>
		</html>
	);
}
