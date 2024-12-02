import { useLocale, useTranslations } from "next-intl";
import type { FC, ReactNode } from "react";

import {
	// BlueskyLogo,
	FlickrLogo,
	LinkedInLogo,
	MastodonLogo,
	TwitterLogo,
	YouTubeLogo,
} from "@/app/(app)/[locale]/_components/social-media-logos";
import { Logo } from "@/components/logo";
import { NavLink, type NavLinkProps } from "@/components/nav-link";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";

export function AppFooter(): ReactNode {
	const locale = useLocale();
	const t = useTranslations("AppFooter");

	const links = {
		contact: {
			href: createHref({ pathname: "/contact" }),
			label: t("links.contact"),
		},
		"privacy-policy": {
			href: createHref({ pathname: "/privacy-policy" }),
			label: t("links.privacy-policy"),
		},
		"terms-of-use": {
			href: createHref({ pathname: "/terms-of-use" }),
			label: t("links.terms-of-use"),
		},
		imprint: {
			href: createHref({ pathname: "/imprint" }),
			label: t("links.imprint"),
		},
	} satisfies Record<string, { href: NavLinkProps["href"]; label: string }>;

	const socialMedia = {
		// bluesky: {
		// 	href: "https://bsky.app/acdh_oeaw",
		// 	label: t("social-media.bluesky"),
		// 	// icon: "/assets/images/logo-bluesky.svg",
		// 	icon: BlueskyLogo,
		// },
		flickr: {
			href: "https://www.flickr.com/photos/142235661@N08/albums/",
			label: t("social-media.flickr"),
			// icon: "/assets/images/logo-flickr.svg",
			icon: FlickrLogo,
		},
		linkedin: {
			href: "https://www.linkedin.com/company/dariah-eric",
			label: t("social-media.linkedin"),
			// icon: "/assets/images/logo-linkedin.svg",
			icon: LinkedInLogo,
		},
		mastodon: {
			href: "https://mastodon.social/@dariaheu",
			label: t("social-media.mastodon"),
			// icon: "/assets/images/logo-mastodon.svg",
			icon: MastodonLogo,
		},
		twitter: {
			href: "https://twitter.com/dariaheu",
			label: t("social-media.twitter"),
			// icon: "/assets/images/logo-twitter.svg",
			icon: TwitterLogo,
		},
		youtube: {
			href: "https://www.youtube.com/channel/UCeQpM_gUvNZXUWf6qQ226GQ",
			label: t("social-media.youtube"),
			// icon: "/assets/images/logo-youtube.svg",
			icon: YouTubeLogo,
		},
	} satisfies Record<string, { href: string; label: string; icon: FC }>;

	const dariahLinks = {
		en: { href: "https://www.dariah.eu" },
	} satisfies Record<Locale, { href: string }>;

	return (
		<footer className="layout-grid grid gap-y-6 border-t border-stroke-weak py-12">
			<div className="grid gap-y-8 xs:flex xs:items-center xs:justify-between">
				<Logo className="h-8 w-auto shrink-0 text-text-brand" />

				<nav aria-label="navigation-social-media">
					<ul className="flex flex-wrap items-center gap-x-6" role="list">
						{Object.entries(socialMedia).map(([id, link]) => {
							const Icon = link.icon;

							return (
								<li key={id} className="shrink-0">
									<NavLink
										className="focus-visible:focus-outline inline-block rounded-0.5"
										href={link.href}
									>
										{/* <img
											alt=""
											className="size-6 text-icon-neutral transition hover:text-icon-brand"
											loading="lazy"
											src={link.icon}
										/> */}
										<Icon className="size-6 text-icon-neutral transition hover:text-icon-brand" />
										<span className="sr-only">{link.label}</span>
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			<div className="grid gap-y-8">
				<nav aria-label={t("navigation-secondary")}>
					<ul className="flex items-center gap-x-6 text-small text-text-weak" role="list">
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<NavLink
										className="focus-visible:focus-outline rounded-0.5 hover:underline"
										href={link.href}
									>
										{link.label}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				<small className="text-tiny text-text-weak">
					&copy; {new Date().getUTCFullYear()}{" "}
					<a
						className="focus-visible:focus-outline rounded-0.5 hover:underline"
						href={dariahLinks[locale].href}
					>
						DARIAH EU
					</a>
				</small>
			</div>
		</footer>
	);
}
