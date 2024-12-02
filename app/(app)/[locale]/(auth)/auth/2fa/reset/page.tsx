// eslint-disable-next-line check-file/folder-naming-convention
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { TwoFactorResetForm } from "@/app/[locale]/auth/2fa/reset/_components/two-factor-reset-form";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { globalGETRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

interface TwoFactorResetPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<TwoFactorResetPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "TwoFactorResetPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function TwoFactorResetPage(
	props: Readonly<TwoFactorResetPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("TwoFactorResetPage");
	const e = await getTranslations("errors");

	if (!globalGETRateLimit()) {
		return e("too-many-requests");
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return redirect({ href: urls.signIn, locale });
	}
	if (!user.emailVerified) {
		return redirect({ href: urls.verifyEmail, locale });
	}
	if (!user.registered2FA) {
		return redirect({ href: urls["2faSetup"], locale });
	}
	if (session.twoFactorVerified) {
		return redirect({ href: urls.afterSignIn, locale });
	}

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					{/* <p className="font-heading text-small text-text-weak xs:text-heading-4">{t("message")}</p> */}
				</div>
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<TwoFactorResetForm />
			</section>
		</MainContent>
	);
}
