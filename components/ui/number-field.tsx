"use client";

import {
	composeRenderProps,
	NumberField as AriaNumberField,
	type NumberFieldProps as AriaNumberFieldProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const numberFieldStyles = variants({
	base: ["group grid content-start gap-y-1.5"],
});

export type NumberFieldStyles = VariantProps<typeof numberFieldStyles>;

export interface NumberFieldProps extends AriaNumberFieldProps, NumberFieldStyles {}

export function NumberField(props: NumberFieldProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaNumberField
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return numberFieldStyles({ ...renderProps, className });
			})}
		>
			{children}
		</AriaNumberField>
	);
}
