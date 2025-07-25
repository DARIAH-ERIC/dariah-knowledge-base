"use client";

import {
	composeRenderProps,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const formFieldsGroupStyles = variants({
	base: ["group grid content-start gap-y-6"],
});

export type FormFieldsGroupStyles = VariantProps<typeof formFieldsGroupStyles>;

export interface FormFieldsGroupProps extends AriaGroupProps, FormFieldsGroupStyles {}

export function FormFieldsGroup(props: FormFieldsGroupProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaGroup
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return formFieldsGroupStyles({ ...renderProps, className });
			})}
		>
			{children}
		</AriaGroup>
	);
}
