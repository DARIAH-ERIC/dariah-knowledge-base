import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { ResetPasswordForm } from "@/app/(app)/[locale]/(auth)/auth/reset-password/_components/reset-password-form";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { validatePasswordResetSessionRequest } from "@/lib/server/auth/password-reset-sessions";
import { globalGETRateLimit } from "@/lib/server/auth/requests";

interface ResetPasswordPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<ResetPasswordPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "ResetPasswordPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ResetPasswordPage(
	props: Readonly<ResetPasswordPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("ResetPasswordPage");
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
	if (user.registered2FA && !session.twoFactorVerified) {
		return redirect({ href: urls.resetPassword2fa, locale });
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
				<ResetPasswordForm />
			</section>
		</MainContent>
	);
}
