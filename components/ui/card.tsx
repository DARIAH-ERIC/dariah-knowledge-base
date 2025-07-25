"use client";

import type { ComponentPropsWithoutRef } from "react";
import {
	Heading as AriaCardTitle,
	type HeadingProps as AriaCardTitleProps,
	Text as AriaCardDescription,
	type TextProps as AriaCardDescriptionProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const cardStyles = variants({
	base: [
		"relative grid min-w-80 max-w-(--breakpoint-sm) content-start gap-y-6 overflow-auto",
		"rounded-md p-6",
		"bg-neutral-0 dark:bg-neutral-900",
		"border border-neutral-950/10",
		"shadow-lg",
	],
});

export type CardStyles = VariantProps<typeof cardStyles>;

export interface CardProps extends ComponentPropsWithoutRef<"article">, CardStyles {}

export function Card(props: CardProps) {
	const { children, className, ...rest } = props;

	return (
		<article {...rest} className={cardStyles({ className })}>
			{children}
		</article>
	);
}

export const cardHeaderStyles = variants({
	base: ["flex flex-col gap-y-2"],
});

export type CardHeaderStyles = VariantProps<typeof cardHeaderStyles>;

export interface CardHeaderProps extends ComponentPropsWithoutRef<"header">, CardHeaderStyles {}

export function CardHeader(props: CardHeaderProps) {
	const { children, className, ...rest } = props;

	return (
		<header {...rest} className={cardHeaderStyles({ className })}>
			{children}
		</header>
	);
}

export const cardTitleStyles = variants({
	base: [
		"text-balance text-md font-semibold leading-tight tracking-tight text-neutral-950 dark:text-neutral-0",
	],
});

export type CardTitleStyles = VariantProps<typeof cardTitleStyles>;

export interface CardTitleProps extends AriaCardTitleProps, CardTitleStyles {}

export function CardTitle(props: CardTitleProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaCardTitle {...rest} className={cardTitleStyles({ className })} slot="title">
			{children}
		</AriaCardTitle>
	);
}

export const cardDescriptionStyles = variants({
	base: ["text-pretty text-sm leading-normal text-neutral-600 dark:text-neutral-400"],
});

export type CardDescriptionStyles = VariantProps<typeof cardDescriptionStyles>;

export interface CardDescriptionProps extends AriaCardDescriptionProps, CardDescriptionStyles {}

export function CardDescription(props: CardDescriptionProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaCardDescription
			{...rest}
			className={cardDescriptionStyles({ className })}
			// TODO: aria-describedby
			slot="description"
		>
			{children}
		</AriaCardDescription>
	);
}

export const cardFooterStyles = variants({
	base: ["flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"],
});

export type CardFooterStyles = VariantProps<typeof cardFooterStyles>;

export interface CardFooterProps extends ComponentPropsWithoutRef<"footer">, CardFooterStyles {}

export function CardFooter(props: CardFooterProps) {
	const { children, className, ...rest } = props;

	return (
		<footer {...rest} className={cardFooterStyles({ className })}>
			{children}
		</footer>
	);
}
