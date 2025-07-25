"use client";

import { composeRenderProps } from "react-aria-components";

import { Input, type InputProps } from "@/components/ui/input";
import { type VariantProps, variants } from "@/lib/styles";

export const textInputStyles = variants({
	base: [],
});

export type TextInputStyles = VariantProps<typeof textInputStyles>;

export interface TextInputProps extends InputProps, TextInputStyles {}

export function TextInput(props: TextInputProps) {
	const { children, className, ...rest } = props;

	return (
		<Input
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return textInputStyles({ ...renderProps, className });
			})}
		>
			{children}
		</Input>
	);
}
