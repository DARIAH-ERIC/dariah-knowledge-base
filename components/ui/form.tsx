"use client";

import { Form as AriaForm, type FormProps as AriaFormProps } from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const formStyles = variants({
	base: [],
});

export type FormStyles = VariantProps<typeof formStyles>;

export interface FormProps extends AriaFormProps, FormStyles {}

export function Form(props: FormProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaForm {...rest} className={formStyles({ className })}>
			{children}
		</AriaForm>
	);
}
