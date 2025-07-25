"use client";

import { chain } from "@react-aria/utils";
import { XIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, useContext } from "react";
import {
	Button as AriaDialogCloseButton,
	type ButtonProps as AriaDialogCloseButtonProps,
	composeRenderProps,
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	DialogTrigger as AriaDialogTrigger,
	type DialogTriggerProps as AriaDialogTriggerProps,
	Heading as AriaDialogTitle,
	type HeadingProps as AriaDialogTitleProps,
	OverlayTriggerStateContext as AriaOverlayTriggerStateContext,
	Text as AriaDialogDescription,
	type TextProps as AriaDialogDescriptionProps,
} from "react-aria-components";

import {
	Button as AriaDialogActionButton,
	Button as AriaDialogCancelButton,
	type ButtonProps as AriaDialogActionButtonProps,
	type ButtonProps as AriaDialogCancelButtonProps,
} from "@/components/ui/button";
import { type VariantProps, variants } from "@/lib/styles";

export { AriaDialogTrigger as DialogTrigger, type AriaDialogTriggerProps as DialogTriggerProps };

export const dialogStyles = variants({
	base: [
		"outline-solid outline-0",
		"relative grid max-h-[inherit] min-w-96 max-w-(--breakpoint-sm) content-start gap-y-6 overflow-auto",
		"rounded-md",
		"bg-neutral-0 dark:bg-neutral-900",
		"border border-neutral-950/10",
		"shadow-lg",
		"p-6",
	],
});

export type DialogStyles = VariantProps<typeof dialogStyles>;

export interface DialogProps extends AriaDialogProps, DialogStyles {}

export function Dialog(props: DialogProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaDialog {...rest} className={dialogStyles({ className })}>
			{children}
		</AriaDialog>
	);
}

export const dialogHeaderStyles = variants({
	base: ["flex flex-col gap-y-2"],
});

export type DialogHeaderStyles = VariantProps<typeof dialogHeaderStyles>;

export interface DialogHeaderProps extends ComponentPropsWithoutRef<"header">, DialogHeaderStyles {}

export function DialogHeader(props: DialogHeaderProps) {
	const { children, className, ...rest } = props;

	return (
		<header {...rest} className={dialogHeaderStyles({ className })}>
			{children}
		</header>
	);
}

export const dialogTitleStyles = variants({
	base: [
		"text-balance text-md font-semibold leading-tight tracking-tight text-neutral-950 dark:text-neutral-0",
	],
});

export type DialogTitleStyles = VariantProps<typeof dialogTitleStyles>;

export interface DialogTitleProps extends AriaDialogTitleProps, DialogTitleStyles {}

export function DialogTitle(props: DialogTitleProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaDialogTitle {...rest} className={dialogTitleStyles({ className })} slot="title">
			{children}
		</AriaDialogTitle>
	);
}

export const dialogDescriptionStyles = variants({
	base: ["text-pretty text-sm leading-normal text-neutral-600 dark:text-neutral-400"],
});

export type DialogDescriptionStyles = VariantProps<typeof dialogDescriptionStyles>;

export interface DialogDescriptionProps
	extends AriaDialogDescriptionProps,
		DialogDescriptionStyles {}

export function DialogDescription(props: DialogDescriptionProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaDialogDescription
			{...rest}
			className={dialogDescriptionStyles({ className })}
			slot="description"
		>
			{children}
		</AriaDialogDescription>
	);
}

export const dialogFooterStyles = variants({
	base: ["flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"],
});

export type DialogFooterStyles = VariantProps<typeof dialogFooterStyles>;

export interface DialogFooterProps extends ComponentPropsWithoutRef<"footer">, DialogFooterStyles {}

export function DialogFooter(props: DialogFooterProps) {
	const { children, className, ...rest } = props;

	return (
		<footer {...rest} className={dialogFooterStyles({ className })}>
			{children}
		</footer>
	);
}

export const dialogCloseButtonStyles = variants({
	base: [
		"absolute right-4 top-4 cursor-default transition",
		"rounded-sm",
		"opacity-70 hover:opacity-100 pressed:opacity-90",
	],
});

export type DialogCloseButtonStyles = VariantProps<typeof dialogCloseButtonStyles>;

export interface DialogCloseButtonProps
	extends Omit<AriaDialogCloseButtonProps, "children">,
		DialogCloseButtonStyles {
	"aria-label": string;
}

export function DialogCloseButton(props: DialogCloseButtonProps) {
	const { className, onPress, ...rest } = props;

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { close } = useContext(AriaOverlayTriggerStateContext)!;

	return (
		<AriaDialogCloseButton
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return dialogCloseButtonStyles({ ...renderProps, className });
			})}
			onPress={chain(onPress, close)}
		>
			<XIcon aria-hidden={true} className="size-4 shrink-0" />
		</AriaDialogCloseButton>
	);
}

export const dialogCancelButtonStyles = variants({
	base: [],
});

export type DialogCancelButtonStyles = VariantProps<typeof dialogCancelButtonStyles>;

export interface DialogCancelButtonProps
	extends AriaDialogCancelButtonProps,
		DialogCancelButtonStyles {}

export function DialogCancelButton(props: DialogCancelButtonProps) {
	const { children, className, onPress, variant = "plain", ...rest } = props;

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { close } = useContext(AriaOverlayTriggerStateContext)!;

	return (
		<AriaDialogCancelButton
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return dialogCancelButtonStyles({ ...renderProps, className });
			})}
			onPress={chain(onPress, close)}
			variant={variant}
		>
			{children}
		</AriaDialogCancelButton>
	);
}

export const dialogActionButtonStyles = variants({
	base: [],
});

export type DialogActionButtonStyles = VariantProps<typeof dialogActionButtonStyles>;

export interface DialogActionButtonProps
	extends AriaDialogActionButtonProps,
		DialogActionButtonStyles {}

export function DialogActionButton(props: DialogActionButtonProps) {
	const { children, className, onPress, ...rest } = props;

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { close } = useContext(AriaOverlayTriggerStateContext)!;

	return (
		<AriaDialogActionButton
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return dialogActionButtonStyles({ ...renderProps, className });
			})}
			onPress={chain(onPress, close)}
		>
			{children}
		</AriaDialogActionButton>
	);
}
