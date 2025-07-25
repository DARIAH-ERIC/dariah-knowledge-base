import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { AppMobileNavLink } from "@/components/app-mobile-nav-link";
import { AppNavLink } from "@/components/app-nav-link";
import { AuthControls } from "@/components/auth-controls";
import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";
import type { LinkProps } from "@/components/link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { Drawer, DrawerTrigger } from "@/components/ui/blocks/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { createHref } from "@/lib/navigation/create-href";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const links = {
		home: {
			href: createHref({ pathname: "/" }),
			label: t("links.home"),
		},
		dashboard: {
			href: createHref({ pathname: "/dashboard" }),
			label: t("links.dashboard"),
		},
		documentation: {
			href: createHref({ pathname: "/documentation/guidelines" }),
			label: t("links.documentation"),
		},
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

	return (
		<header className="border-b border-neutral-200 dark:border-neutral-800">
			<div className="container flex items-center justify-between gap-4 py-4">
				<nav aria-label={t("navigation-primary")} className="-ml-3">
					<ul className="hidden items-center gap-4 text-sm sm:flex" role="list">
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<AppNavLink href={link.href}>
										{id === "home" ? (
											<div className="inline-flex items-center gap-2.5">
												<Logo className="size-6 shrink-0 " />
												<span className="sr-only sm:not-sr-only">{link.label}</span>
											</div>
										) : (
											link.label
										)}
									</AppNavLink>
								</li>
							);
						})}
					</ul>

					<div className="flex sm:hidden">
						<DrawerTrigger>
							<IconButton aria-label={"toggle-navigation-menu"} variant="plain">
								<MenuIcon aria-hidden={true} className="size-5 shrink-0" />
							</IconButton>
							<Drawer title={t("navigation-menu")}>
								<ul className="-mx-3 grid gap-y-4 text-sm" role="list">
									{Object.entries(links).map(([id, link]) => {
										return (
											<li key={id}>
												<AppMobileNavLink href={link.href}>{link.label}</AppMobileNavLink>
											</li>
										);
									})}
								</ul>
							</Drawer>
						</DrawerTrigger>
					</div>
				</nav>

				<div className="-mr-3 flex items-center gap-x-4">
					<div className="flex items-center gap-x-1">
						<ColorSchemeSwitcher />
						<LocaleSwitcher />
					</div>
					<AuthControls />
				</div>
			</div>
		</header>
	);
}
