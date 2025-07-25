"use client";

import {
	composeRenderProps,
	TextArea as AriaTextArea,
	type TextAreaProps as AriaTextAreaProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const textAreaStyles = variants({
	base: [
		"block w-full min-w-0 appearance-none transition",
		"resize-none data-resizable:resize-y",
		"rounded-md px-3 py-1.5",
		"text-sm leading-normal text-neutral-950 placeholder:text-neutral-500 dark:text-neutral-0",
		"border border-neutral-950/10 hover:border-neutral-950/20 dark:border-neutral-0/10 dark:hover:border-neutral-0/20",
		"bg-neutral-0 dark:bg-neutral-0/5",
		"shadow-xs dark:shadow-none",
		"invalid:border-negative-500 invalid:shadow-negative-500/10 invalid:hover:border-negative-500 dark:invalid:border-negative-500 dark:invalid:hover:border-negative-500",
		"disabled:border-neutral-950/20 disabled:bg-neutral-950/5 disabled:opacity-50 disabled:shadow-none dark:disabled:border-neutral-0/15 dark:disabled:hover:border-neutral-0/15",
		"outline-solid outline-0 outline-neutral-950 invalid:outline-negative-500 focus:outline-1 focus-visible:outline-2 dark:outline-neutral-0 forced-colors:outline-[Highlight]",
	],
});

export type TextAreaStyles = VariantProps<typeof textAreaStyles>;

export interface TextAreaProps extends AriaTextAreaProps, TextAreaStyles {
	/** @default true */
	isResizable?: boolean;
}

export function TextArea(props: TextAreaProps) {
	const { children, className, isResizable = true, ...rest } = props;

	return (
		<AriaTextArea
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return textAreaStyles({ ...renderProps, className });
			})}
			data-resizable={isResizable ? "true" : undefined}
		>
			{children}
		</AriaTextArea>
	);
}
