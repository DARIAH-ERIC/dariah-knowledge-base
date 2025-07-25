"use client";

import {
	Heading as AriaFormSectionTitle,
	type HeadingProps as AriaFormSectionTitleProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const FormSectionTitleStyles = variants({
	base: [
		"transition",
		"text-sm font-semibold leading-normal text-neutral-950 dark:text-neutral-0",
		"disabled:opacity-50",
	],
});

export type FormSectionTitleStyles = VariantProps<typeof FormSectionTitleStyles>;

export interface FormSectionTitleProps extends AriaFormSectionTitleProps, FormSectionTitleStyles {}

export function FormSectionTitle(props: FormSectionTitleProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaFormSectionTitle {...rest} className={FormSectionTitleStyles({ className })}>
			{children}
		</AriaFormSectionTitle>
	);
}
