import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
	AppNavigation,
	AppNavigationMobile,
	type NavigationItem,
} from "@/app/(app)/[locale]/_components/app-navigation";
import { ColorSchemeSwitcher } from "@/app/(app)/[locale]/_components/color-scheme-switcher";
import { NavLink } from "@/components/nav-link";
// import { LocaleSwitcher } from "@/app/(app)/[locale]/_components/locale-switcher";
import { createHref } from "@/lib/create-href";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const label = t("navigation-primary");

	const navigation = {
		home: {
			type: "link",
			href: createHref({ pathname: "/" }),
			label: t("links.home"),
		},
		documentation: {
			type: "link",
			href: createHref({ pathname: "/documentation" }),
			label: t("links.documentation"),
		},
		dashboard: {
			type: "link",
			href: createHref({ pathname: "/dashboard" }),
			label: t("links.dashboard"),
		},
	} satisfies Record<string, NavigationItem>;

	return (
		<header className="layout-grid border-b border-stroke-weak bg-fill-weaker">
			<div className="flex justify-between gap-x-12">
				<AppNavigation label={label} navigation={navigation} />
				<AppNavigationMobile
					label={label}
					menuCloseLabel={t("navigation-menu-close")}
					menuOpenLabel={t("navigation-menu-open")}
					menuTitleLabel={t("navigation-menu")}
					navigation={navigation}
				/>

				<div className="flex items-center gap-x-6">
					<AuthButtonGroup />
					<ColorSchemeSwitcher />
					{/* <LocaleSwitcher /> */}
				</div>
			</div>
		</header>
	);
}

function AuthButtonGroup(): ReactNode {
	return (
		<div className="flex items-center gap-x-2">
			<NavLink
				className={cn(
					"inline-flex min-h-8 items-center rounded-2 border border-stroke-brand-strong px-3 py-1 text-tiny font-strong text-text-brand shadow-raised",
					"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
				)}
				href={createHref({ pathname: "/auth/sign-in" })}
			>
				Sign in
			</NavLink>
		</div>
	);
}
