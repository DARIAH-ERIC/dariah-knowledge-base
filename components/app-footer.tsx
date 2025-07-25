import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { AppNavLink } from "@/components/app-nav-link";
import type { LinkProps } from "@/components/link";
import { createHref } from "@/lib/navigation/create-href";

export function AppFooter(): ReactNode {
	const t = useTranslations("AppFooter");

	const links = {
		contact: { href: createHref({ pathname: "/contact" }), label: t("links.contact") },
		"privacy-policy": {
			href: createHref({ pathname: "/privacy-policy" }),
			label: t("links.privacy-policy"),
		},
		"terms-of-use": {
			href: createHref({ pathname: "/terms-of-use" }),
			label: t("links.terms-of-use"),
		},
		imprint: { href: createHref({ pathname: "/imprint" }), label: t("links.imprint") },
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

	return (
		<footer className="border-t border-neutral-200 dark:border-neutral-800">
			<div className="container flex items-center justify-between gap-4 py-4">
				<nav aria-label={t("navigation-secondary")} className="-mx-3">
					<ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" role="list">
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<AppNavLink href={link.href}>{link.label}</AppNavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</footer>
	);
}
