// eslint-disable-next-line check-file/folder-naming-convention
import { getRandomValues } from "node:crypto";

import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { renderSVG } from "uqr";

import { TwoFactorSetUpForm } from "@/app/(app)/[locale]/(auth)/auth/2fa/setup/_components/two-factor-set-up-form";
import { MainContent } from "@/components/main-content";
import { issuer, urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { globalGETRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

interface TwoFactorSetupPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<TwoFactorSetupPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "TwoFactorSetupPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function TwoFactorSetupPage(
	props: Readonly<TwoFactorSetupPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("TwoFactorSetupPage");
	const e = await getTranslations("errors");

	if (!(await globalGETRateLimit())) {
		return e("too-many-requests");
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return redirect({ href: urls.signIn, locale });
	}
	if (!user.emailVerified) {
		return redirect({ href: urls.verifyEmail, locale });
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return redirect({ href: urls["2fa"], locale });
	}

	const totpKey = new Uint8Array(20);
	getRandomValues(totpKey);
	const encodedTOTPKey = encodeBase64(totpKey);
	const keyURI = createTOTPKeyURI(issuer, user.username, totpKey, 30, 6);
	const qrcode = renderSVG(keyURI);

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
				<div className="max-w-text grid gap-y-8">
					<div dangerouslySetInnerHTML={{ __html: qrcode }} className="size-48" />

					<TwoFactorSetUpForm encodedTOTPKey={encodedTOTPKey} />
				</div>
			</section>
		</MainContent>
	);
}
