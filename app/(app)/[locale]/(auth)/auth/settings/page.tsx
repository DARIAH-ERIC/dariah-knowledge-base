import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { RecoveryCodeForm } from "@/app/[locale]/auth/settings/_components/recovery-code-form";
import { UpdateEmailForm } from "@/app/[locale]/auth/settings/_components/update-email-form";
import { UpdatePasswordForm } from "@/app/[locale]/auth/settings/_components/update-password-form";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { globalGETRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";
import { getUserRecoverCode } from "@/lib/server/auth/users";

interface SettingsPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<SettingsPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "SettingsPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SettingsPage(props: Readonly<SettingsPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("SettingsPage");
	const e = await getTranslations("errors");

	if (!globalGETRateLimit()) {
		return e("too-many-requests");
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return redirect({ href: urls.signIn, locale });
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return redirect({ href: urls["2fa"], locale });
	}

	let recoveryCode: string | null = null;
	if (user.registered2FA) {
		recoveryCode = await getUserRecoverCode(user.id);
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
				<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
					{t("update-email")}
				</h2>
				<p>{t("your-email", { email: user.email })}</p>
				<UpdateEmailForm />
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
					{t("update-password")}
				</h2>
				<UpdatePasswordForm />
			</section>

			{user.registered2FA ? (
				<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
					<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
						{t("update-2fa")}
					</h2>
					<Link href={urls["2faSetup"]}>{t("update")}</Link>
				</section>
			) : null}

			{recoveryCode != null && (
				<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
					<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
						{t("recovery-code")}
					</h2>
					<RecoveryCodeForm recoveryCode={recoveryCode} />
				</section>
			)}
		</MainContent>
	);
}
