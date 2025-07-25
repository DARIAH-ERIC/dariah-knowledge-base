"use client";

import {
	composeRenderProps,
	FieldError as AriaFieldError,
	type FieldErrorProps as AriaFieldErrorProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const fieldErrorStyles = variants({
	base: [
		"transition",
		"text-xs leading-normal text-negative-600 dark:text-negative-500",
		"disabled:opacity-50",
	],
});

export type FieldErrorStyles = VariantProps<typeof fieldErrorStyles>;

export interface FieldErrorProps extends AriaFieldErrorProps, FieldErrorStyles {}

export function FieldError(props: FieldErrorProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaFieldError
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return fieldErrorStyles({ ...renderProps, className });
			})}
		>
			{children}
		</AriaFieldError>
	);
}
