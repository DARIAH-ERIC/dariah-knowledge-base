// eslint-disable-next-line check-file/folder-naming-convention
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { PasswordResetRecoveryCodeForm } from "@/app/(app)/[locale]/(auth)/auth/reset-password/2fa/_components/password-reset-recovery-code-form";
import { PasswordResetTOTPForm } from "@/app/(app)/[locale]/(auth)/auth/reset-password/2fa/_components/password-reset-totp-form";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { validatePasswordResetSessionRequest } from "@/lib/server/auth/password-reset-sessions";
import { globalGETRateLimit } from "@/lib/server/auth/requests";

interface PasswordResetTwoFactorPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<PasswordResetTwoFactorPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "PasswordResetTwoFactorPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function PasswordResetTwoFactorPage(
	props: Readonly<PasswordResetTwoFactorPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("PasswordResetTwoFactorPage");
	const e = await getTranslations("errors");

	if (!(await globalGETRateLimit())) {
		return e("too-many-requests");
	}

	const { session, user } = await validatePasswordResetSessionRequest();

	if (session == null) {
		return redirect({ href: urls.forgotPassword, locale });
	}
	if (!session.emailVerified) {
		return redirect({ href: urls.resetPasswordVerifyEmail, locale });
	}
	if (!user.registered2FA) {
		return redirect({ href: urls.resetPassword, locale });
	}
	if (session.twoFactorVerified) {
		return redirect({ href: urls.resetPassword, locale });
	}

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					{/* <p className="font-heading text-small text-text-weak xs:text-heading-4"></p> */}
				</div>
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<div className="max-w-text grid gap-y-8">
					<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
						{t("enter-code")}
					</h2>

					<PasswordResetTOTPForm />
				</div>
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<div className="max-w-text grid gap-y-8">
					<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
						{t("use-recovery-code")}
					</h2>

					<PasswordResetRecoveryCodeForm />
				</div>
			</section>
		</MainContent>
	);
}
