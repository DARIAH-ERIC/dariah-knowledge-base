import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { EmailVerificationForm } from "@/app/(app)/[locale]/(auth)/auth/verify-email/_components/email-verification-form";
import { ResendEmailVerificationCodeForm } from "@/app/(app)/[locale]/(auth)/auth/verify-email/_components/resend-email-verification-code-form";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { getUserEmailVerificationRequestFromRequest } from "@/lib/server/auth/email-verification-requests";
import { globalGETRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

interface VerifyEmailPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<VerifyEmailPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "VerifyEmailPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function VerifyEmailPage(
	props: Readonly<VerifyEmailPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("VerifyEmailPage");
	const e = await getTranslations("errors");

	if (!(await globalGETRateLimit())) {
		return e("too-many-requests");
	}

	const { user } = await getCurrentSession();
	if (user == null) {
		return redirect({ href: urls.signIn, locale });
	}

	/**
	 * Ideally we'd sent a new verification email automatically if the previous one is expired,
	 * but we can't set cookies inside server components.
	 */
	const verificationRequest = await getUserEmailVerificationRequestFromRequest();
	if (verificationRequest == null && user.emailVerified) {
		return redirect({ href: urls.afterSignIn, locale });
	}

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					<p className="font-heading text-small text-text-weak xs:text-heading-4">
						{t("message", { email: verificationRequest?.email ?? user.email })}
					</p>
				</div>
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<EmailVerificationForm />

				<hr className="my-8" />

				<ResendEmailVerificationCodeForm />

				<hr className="my-8" />

				<div className="flex flex-wrap items-center gap-x-6">
					<Link
						className="focus-visible:focus-outline inline-flex items-center gap-x-2 rounded-0.5 text-small text-text-brand underline hover:no-underline"
						href={urls.settings}
					>
						{t("change-email")}
					</Link>
				</div>
			</section>
		</MainContent>
	);
}
