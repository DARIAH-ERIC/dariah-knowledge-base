import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { SignInForm } from "@/components/sign-in-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntlLocale } from "@/lib/i18n/locales";
import { redirect } from "@/lib/navigation/navigation";
import { authSignInPageSearchParams } from "@/lib/schemas/auth";
import { getCurrentSession } from "@/lib/server/auth/get-current-session";

interface AuthSignInPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
	searchParams: Promise<Record<string, Array<string> | string>>;
}

export async function generateMetadata(
	props: AuthSignInPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "AuthSignInPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function AuthSignInPage(props: AuthSignInPageProps): Promise<ReactNode> {
	const { params, searchParams } = props;

	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("AuthSignInPage");

	const { callbackUrl } = authSignInPageSearchParams.parse(await searchParams);

	const { session } = await getCurrentSession();

	if (session != null) {
		redirect({ href: "/dashboard", locale });
	}

	return (
		<MainContent className="container grid place-content-center py-8">
			<Card>
				<CardHeader>
					<CardTitle>{t("title")}</CardTitle>
				</CardHeader>
				{/* TODO: CardForm, which puts submit button in footer, connected to form via attribute */}
				<SignInForm callbackUrl={callbackUrl} />
			</Card>
		</MainContent>
	);
}
