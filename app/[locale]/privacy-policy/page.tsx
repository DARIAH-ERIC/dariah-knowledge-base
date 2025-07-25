import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { IntlLocale } from "@/lib/i18n/locales";
import { createHref } from "@/lib/navigation/create-href";

interface PrivacyPolicyPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: PrivacyPolicyPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "PrivacyPolicyPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function PrivacyPolicyPage(props: PrivacyPolicyPageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("PrivacyPolicyPage");

	return (
		<MainContent className="container grid max-w-(--breakpoint-md) content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<div className="prose prose-sm">
				<p>
					This privacy statement describes how the DARIAH Knowledge Base collects and uses data
					while browsing this website. We are committed to ensuring that your personal details are
					protected when you use our website, or API. If you have any questions about how we use
					your personal information or comply with data protection legislation, please{" "}
					<Link href={createHref({ pathname: "/contact" })}>contact us</Link>.
				</p>

				<h2>What information do we collect?</h2>

				<ul>
					<li>Contact and login details.</li>
					<li>
						We collect contact information for the user accounts, name and email address of the
						logged users. This information is provided directly by the user.
					</li>
				</ul>

				<h2>How do we use this information?</h2>

				<p>The login information is used to manage access to the admin site.</p>

				<h2>Will the DARIAH UNR App share your personal details with anyone else?</h2>

				<p>
					We will not sell, distribute or lease your personal information to third parties unless
					disclosure is required by law. If you feel that this site is not following its stated
					privacy policy, please contact us. We will be sure to address your concerns.
				</p>
			</div>
		</MainContent>
	);
}
