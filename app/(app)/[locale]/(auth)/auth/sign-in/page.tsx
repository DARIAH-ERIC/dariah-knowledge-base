import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SignInForm } from "@/app/[locale]/auth/sign-in/_components/sign-in-form";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { globalGETRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

interface SignInPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<SignInPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "SignInPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SignInPage(props: Readonly<SignInPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("SignInPage");
	const e = await getTranslations("errors");

	if (!globalGETRateLimit()) {
		return e("too-many-requests");
	}

	const { session, user } = await getCurrentSession();

	if (session != null) {
		if (!user.emailVerified) {
			return redirect({ href: urls.verifyEmail, locale });
		}
		if (!user.registered2FA) {
			return redirect({ href: urls["2faSetup"], locale });
		}
		if (!session.twoFactorVerified) {
			return redirect({ href: urls["2fa"], locale });
		}
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
				<SignInForm />

				<hr className="my-8" />

				<div className="flex flex-wrap items-center gap-x-6">
					<Link
						className="focus-visible:focus-outline inline-flex items-center gap-x-2 rounded-0.5 text-small text-text-brand underline hover:no-underline"
						href={urls.signUp}
					>
						{t("sign-up")}
					</Link>
					<Link
						className="focus-visible:focus-outline inline-flex items-center gap-x-2 rounded-0.5 text-small text-text-brand underline hover:no-underline"
						href={urls.forgotPassword}
					>
						{t("forgot-password")}
					</Link>
				</div>
			</section>
		</MainContent>
	);
}
