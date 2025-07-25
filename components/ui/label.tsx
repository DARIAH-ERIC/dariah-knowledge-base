"use client";

import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const labelStyles = variants({
	base: [
		"select-none transition",
		"text-sm font-medium leading-normal text-neutral-950 dark:text-neutral-0",
		"disabled:opacity-50",
	],
});

export type LabelStyles = VariantProps<typeof labelStyles>;

export interface LabelProps extends AriaLabelProps, LabelStyles {}

export function Label(props: LabelProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaLabel {...rest} className={labelStyles({ className })}>
			{children}
		</AriaLabel>
	);
}
