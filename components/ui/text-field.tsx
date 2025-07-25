"use client";

import {
	composeRenderProps,
	TextField as AriaTextField,
	type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const textFieldStyles = variants({
	base: ["group grid content-start gap-y-1.5"],
});

export type TextFieldStyles = VariantProps<typeof textFieldStyles>;

export interface TextFieldProps extends AriaTextFieldProps, TextFieldStyles {}

export function TextField(props: TextFieldProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaTextField
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return textFieldStyles({ ...renderProps, className });
			})}
		>
			{children}
		</AriaTextField>
	);
}
