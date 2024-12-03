import { cn } from "@acdh-oeaw/style-variants";
import { HomeIcon } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AccountMenu } from "@/app/(app)/[locale]/_components/account-menu";
import { ReportsTable } from "@/app/(app)/[locale]/(dashboard)/_components/reports-table";
import { Link } from "@/components/link";
import { Logo } from "@/components/logo";
import { MainContent } from "@/components/main-content";
import { NavLink } from "@/components/nav-link";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";
import { redirect } from "@/lib/i18n/navigation";
import { globalGETRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

interface DashboardPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<DashboardPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "DashboardPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function DashboardPage(
	props: Readonly<DashboardPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("DashboardPage");
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
	if (!user.registered2FA) {
		return redirect({ href: urls["2faSetup"], locale });
	}
	if (!session.twoFactorVerified) {
		return redirect({ href: urls["2fa"], locale });
	}

	const links = {
		home: {
			type: "link",
			href: createHref({ pathname: "/dashboard" }),
			label: t("links.overview"),
			icon: HomeIcon,
		},
	};

	return (
		<div className="grid min-h-full grid-cols-[20rem_1fr]">
			<aside className="grid grid-rows-[auto_1fr_auto] border-r border-stroke-weak bg-background-raised pb-3">
				<div className="py-3">
					<div className="px-6 py-3">
						<Logo className="size-8 text-text-brand" />
					</div>

					<div>{/* TODO: Search input */}</div>
				</div>

				<nav>
					<ul role="list">
						{Object.entries(links).map(([id, item]) => {
							const Icon = item.icon;

							return (
								<li key={id}>
									<NavLink
										className={cn(
											"inline-flex w-full gap-x-3 px-6 py-3 text-text-strong",
											"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
											"aria-[current]:hover-overlay aria-[current]:select-overlay",
										)}
										href={item.href}
									>
										<Icon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" />
										{item.label}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="px-6 py-3">
					<div className="grid gap-y-1 rounded-2 border border-stroke-weak bg-fill-weaker p-4 text-tiny">
						<div className="font-strong text-text-strong">Need help?</div>
						<p className="text-text-weak">Read the documentation guide.</p>
						<Link
							className="mt-1 underline hover:no-underline"
							href={createHref({ pathname: "/documentation" })}
						>
							Documentation
						</Link>
					</div>
				</div>
			</aside>

			<div>
				<header className="border-b border-stroke-weak">
					<div className="flex min-h-18 items-center justify-end px-8 py-3">
						<AccountMenu user={user} />
					</div>
				</header>

				<MainContent className="grid gap-y-12 px-8 py-12">
					<header>
						{/* <h1>{t("title")}</h1> */}
						<h1 className="font-heading text-heading-1 font-strong text-text-strong">
							{t("hi", { name: user.username })}
						</h1>
					</header>

					<hr className="border-t border-stroke-weak" />

					<div className="grid gap-y-6">
						<h2 className="text-heading-2 font-strong text-text-strong">Reports</h2>

						<ReportsTable />
					</div>
				</MainContent>
			</div>
		</div>
	);
}
