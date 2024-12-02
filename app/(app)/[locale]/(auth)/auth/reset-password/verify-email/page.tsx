import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { PasswordResetEmailVerificationForm } from "@/app/[locale]/auth/reset-password/verify-email/_components/password-reset-email-verification-form";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { validatePasswordResetSessionRequest } from "@/lib/server/auth/password-reset-sessions";
import { globalGETRateLimit } from "@/lib/server/auth/requests";

interface PasswordResetVerifyEmailPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<PasswordResetVerifyEmailPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "PasswordResetVerifyEmailPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function PasswordResetVerifyEmailPage(
	props: Readonly<PasswordResetVerifyEmailPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("PasswordResetVerifyEmailPage");
	const e = await getTranslations("errors");

	if (!globalGETRateLimit()) {
		return e("too-many-requests");
	}

	const { session } = await validatePasswordResetSessionRequest();

	if (session == null) {
		return redirect({ href: urls.forgotPassword, locale });
	}
	if (session.emailVerified) {
		if (!session.twoFactorVerified) {
			return redirect({ href: urls.resetPassword2fa, locale });
		}

		return redirect({ href: urls.resetPassword, locale });
	}

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					<p className="font-heading text-small text-text-weak xs:text-heading-4">
						{t("message", { email: session.email })}
					</p>
				</div>
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<PasswordResetEmailVerificationForm />
			</section>
		</MainContent>
	);
}
