import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import type { IntlLocale } from "@/lib/i18n/locales";
import { createHref } from "@/lib/navigation/create-href";

interface TermsOfUsePageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: TermsOfUsePageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "TermsOfUsePage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function TermsOfUsePage(props: TermsOfUsePageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("TermsOfUsePage");

	return (
		<MainContent className="container grid max-w-(--breakpoint-md) content-start gap-y-8 py-8">
			<PageTitle>{t("title")}</PageTitle>

			<div className="prose prose-sm">
				<p>
					This Acceptable Use Policy and Conditions of Use (“AUP”) defines the rules and conditions
					that govern your access to and use (including transmission, processing, and storage of
					data) of the Unified National Report App (“Service”) as granted by DARIAH ERIC for the
					purpose of collecting information on its members.
				</p>

				<ol>
					<li>
						You shall only use the Service in a manner consistent with the policies and for the
						purposes described above, show consideration towards other users, and collaborate in the
						resolution of issues arising from your use of the Service.
					</li>
					<li>
						You shall only use the Service for lawful purposes and not breach, attempt to breach,
						nor circumvent administrative or security controls.
					</li>
					<li>You shall respect intellectual property and confidentiality agreements.</li>
					<li>
						You shall protect your access credentials (e.g. passwords, private keys or multi-factor
						tokens); no intentional sharing is permitted.
					</li>
					<li>You shall keep your registered information correct and up to date.</li>
					<li>
						You shall promptly report known or suspected security breaches, credential compromise,
						or misuse to the security contact stated below; and report any compromised credentials
						to the relevant issuing authorities.
					</li>
					<li>
						Reliance on the Service shall only be to the extent specified by any applicable service
						level agreements listed below. Use without such agreements is at your own risk.
					</li>
					<li>
						Your personal data will be processed in accordance with the privacy statements
						referenced below.
					</li>
					<li>
						Your use of the Services may be restricted or suspended, for administrative,
						operational, or security reasons, without prior notice and without compensation.
					</li>
					<li>
						If you violate these rules, you may be liable for the consequences, which may include a
						report being made to your home organisation or to law enforcement.
					</li>
				</ol>

				<p>
					The administrative contact for this AUP is:{" "}
					<a href={`mailto:unr2024@dariah.eu`}>unr2024@dariah.eu</a>.
				</p>

				<p>
					The security contact for this AUP is:{" "}
					<a href="mailto:technical-support@dariah.eu">technical-support@dariah.eu</a>.
				</p>

				<p>
					The privacy policy is located{" "}
					<Link href={createHref({ pathname: "/privacy-policy" })}>here</Link>.
				</p>

				<p>Based on CESSDA AUP and used under CC BY-NC-SA 4.0.</p>
			</div>
		</MainContent>
	);
}
