import { createNavigation } from "next-intl/navigation";
import type { ComponentPropsWithRef, FC } from "react";

import { routing } from "@/lib/i18n/routing";

const {
	Link,
	getPathname,
	redirect: _redirect,
	usePathname,
	useRouter,
} = createNavigation(routing);

/** FIXME: @see https://github.com/amannn/next-intl/issues/823 */
const redirect: typeof _redirect = _redirect;

export { getPathname, redirect, usePathname, useRouter };

export { useSearchParams } from "next/navigation";

export type LocaleLinkProps = Omit<ComponentPropsWithRef<typeof Link>, "href"> & {
	href: string | undefined;
};

export const LocaleLink = Link as FC<LocaleLinkProps>;

export interface NavigationAction {
	type: "action";
	onAction: () => void;
	label: string;
}

export interface NavigationLink {
	type: "link";
	href: string;
	label: string;
}

export interface NavigationSeparator {
	type: "separator";
}

export type NavigationMenuItem = NavigationLink | NavigationSeparator | NavigationAction;

export interface NavigationMenu {
	type: "menu";
	label: string;
	children: Record<string, NavigationMenuItem>;
}

export type NavigationItem =
	| NavigationAction
	| NavigationLink
	| NavigationSeparator
	| NavigationMenu;
