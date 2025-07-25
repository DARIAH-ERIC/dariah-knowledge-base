"use client";

import type { ComponentPropsWithoutRef } from "react";

import { type VariantProps, variants } from "@/lib/styles";

export const FormSectionStyles = variants({
	base: ["group grid content-start gap-y-8"],
});

export type FormSectionStyles = VariantProps<typeof FormSectionStyles>;

export interface FormSectionProps extends ComponentPropsWithoutRef<"section">, FormSectionStyles {}

export function FormSection(props: FormSectionProps) {
	const { children, className, ...rest } = props;

	return (
		<section {...rest} className={FormSectionStyles({ className })}>
			{children}
		</section>
	);
}
