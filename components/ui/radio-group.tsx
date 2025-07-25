"use client";

import { type ComponentPropsWithoutRef, Fragment } from "react";
import {
	composeRenderProps,
	Radio as AriaRadio,
	RadioGroup as AriaRadioGroup,
	type RadioGroupProps as AriaRadioGroupProps,
	type RadioProps as AriaRadioProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const radioGroupStyles = variants({
	base: ["group grid content-start gap-y-1.5"],
});

export type RadioGroupStyles = VariantProps<typeof radioGroupStyles>;

export interface RadioGroupProps extends AriaRadioGroupProps, RadioGroupStyles {}

export function RadioGroup(props: RadioGroupProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaRadioGroup
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return radioGroupStyles({ ...renderProps, className });
			})}
		>
			{children}
		</AriaRadioGroup>
	);
}

export const radioStyles = variants({
	base: ["group grid grid-cols-[auto_auto] items-center justify-start gap-x-2 text-sm"],
});

export type RadioStyles = VariantProps<typeof radioStyles>;

export interface RadioProps extends AriaRadioProps, RadioStyles {}

export function Radio(props: RadioProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaRadio
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return radioStyles({ ...renderProps, className });
			})}
		>
			{composeRenderProps(children, (children, _renderProps) => {
				return (
					<Fragment>
						<RadioBox />
						{children}
					</Fragment>
				);
			})}
		</AriaRadio>
	);
}

export const radioBoxStyles = variants({
	base: [
		"inline-grid aspect-square size-4 place-content-center transition",
		"rounded-full",
		"border border-neutral-950/15 group-hover:border-neutral-950/30 dark:border-neutral-0/15 dark:group-hover:border-neutral-0/30",
		"bg-neutral-0 dark:bg-neutral-0/5",
		"shadow-xs dark:shadow-none",
		"group-selected:bg-neutral-50",
	],
});

export type RadioBoxStyles = VariantProps<typeof radioBoxStyles>;

export interface RadioBoxProps extends ComponentPropsWithoutRef<"div">, RadioBoxStyles {}

export function RadioBox(props: RadioBoxProps) {
	const { className, ...rest } = props;

	return (
		<div {...rest} className={radioBoxStyles({ className })}>
			<span className={radioBoxIndicatorStyles()} />
		</div>
	);
}

const radioBoxIndicatorStyles = variants({
	base: [
		"size-2 transition",
		"rounded-full",
		"bg-transparent group-hover:bg-neutral-950/15",
		"group-selected:bg-neutral-950",
	],
});
