"use client";

import {
	composeRenderProps,
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
} from "react-aria-components";

import { TouchTarget } from "@/components/ui/touch-target";
import { type VariantProps, variants } from "@/lib/styles";

export const linkStyles = variants({
	base: [
		"relative underline transition",
		"text-sm leading-normal",
		"text-neutral-950 decoration-neutral-950/50 underline-offset-4 hover:decoration-neutral-950 dark:text-neutral-0 dark:decoration-neutral-0/50 dark:hover:decoration-neutral-0",
	],
});

export type LinkStyles = VariantProps<typeof linkStyles>;

export interface LinkProps extends AriaLinkProps, LinkStyles {}

export function Link(props: LinkProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaLink
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return linkStyles({ ...renderProps, className });
			})}
		>
			{composeRenderProps(children, (children, _renderProps) => {
				return <TouchTarget>{children}</TouchTarget>;
			})}
		</AriaLink>
	);
}
