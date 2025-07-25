"use client";

import { Text as AriaText, type TextProps as AriaTextProps } from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const textStyles = variants({
	base: ["text-sm leading-normal text-neutral-600 dark:text-neutral-400"],
});

export type TextStyles = VariantProps<typeof textStyles>;

export interface TextProps extends AriaTextProps, TextStyles {}

export function Text(props: TextProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaText {...rest} className={textStyles({ className })}>
			{children}
		</AriaText>
	);
}
