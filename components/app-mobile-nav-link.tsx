"use client";

import { chain } from "@react-aria/utils";
import { type ReactNode, useContext } from "react";
import { OverlayTriggerStateContext } from "react-aria-components";

import { AppNavLink } from "@/components/app-nav-link";
import type { LinkProps } from "@/components/link";

interface AppMobileNavLinkProps extends LinkProps {}

export function AppMobileNavLink(props: AppMobileNavLinkProps): ReactNode {
	const { children, onClick, ...rest } = props;

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { close } = useContext(OverlayTriggerStateContext)!;

	return (
		<AppNavLink {...rest} onClick={chain(onClick, close)}>
			{children}
		</AppNavLink>
	);
}
