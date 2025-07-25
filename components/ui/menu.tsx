"use client";

import {
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps as AriaMenuProps,
	MenuTrigger as AriaMenuTrigger,
	type MenuTriggerProps as AriaMenuTriggerProps,
	Popover as AriaMenuPopover,
	type PopoverProps as AriaMenuPopoverProps,
	Separator as AriaMenuSeparator,
	type SeparatorProps as AriaMenuSeparatorProps,
	SubmenuTrigger as AriaSubMenuTrigger,
	type SubmenuTriggerProps as AriaSubMenuTriggerProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export {
	AriaMenuTrigger as MenuTrigger,
	type AriaMenuTriggerProps as MenuTriggerProps,
	AriaSubMenuTrigger as SubMenuTrigger,
	type AriaSubMenuTriggerProps as SubMenuTriggerProps,
};

export const menuPopoverStyles = variants({
	base: ["w-max min-w-(--trigger-width)"],
});

export type MenuPopoverStyles = VariantProps<typeof menuPopoverStyles>;

export interface MenuPopoverProps extends AriaMenuPopoverProps, MenuPopoverStyles {}

export function MenuPopover(props: MenuPopoverProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaMenuPopover {...rest} className={menuPopoverStyles({ className })}>
			{children}
		</AriaMenuPopover>
	);
}

export const menuStyles = variants({
	base: [
		"outline-solid outline-1 outline-transparent transition",
		// "overflow-y-scroll overscroll-contain",
		"select-none",
		"rounded-md p-1",
		"bg-neutral-0 dark:bg-neutral-800",
		"shadow-lg",
		// "backdrop-blur-xl",
		"border border-neutral-950/10 dark:border-neutral-0/10",
		"text-sm text-neutral-950 dark:text-neutral-0",
	],
});

export type MenuStyles = VariantProps<typeof menuStyles>;

export interface MenuProps<T extends object> extends AriaMenuProps<T>, MenuStyles {}

export function Menu<T extends object>(props: MenuProps<T>) {
	const { children, className, ...rest } = props;

	return (
		<AriaMenu<T> {...rest} className={menuStyles({ className })}>
			{children}
		</AriaMenu>
	);
}

export const menuItemStyles = variants({
	base: [
		"outline-transparent",
		"flex items-center justify-between gap-x-4",
		"transition",
		"rounded-sm py-1.5 pl-3 pr-2",
		"focus:bg-neutral-950/5 dark:focus:bg-neutral-0/5",
	],
});

export type MenuItemStyles = VariantProps<typeof menuItemStyles>;

export interface MenuItemProps<T extends object> extends AriaMenuItemProps<T>, MenuItemStyles {}

export function MenuItem<T extends object>(props: MenuItemProps<T>) {
	const { children, className, ...rest } = props;

	return (
		<AriaMenuItem<T> {...rest} className={menuItemStyles({ className })}>
			{children}
		</AriaMenuItem>
	);
}

export const MenuSeparatorStyles = variants({
	base: ["my-2 h-px w-full bg-neutral-200 dark:bg-neutral-700"],
});

export type menuSeparatorStyles = VariantProps<typeof MenuSeparatorStyles>;

export interface MenuSeparatorProps extends AriaMenuSeparatorProps, menuSeparatorStyles {}

export function MenuSeparator(props: MenuSeparatorProps) {
	const { className, ...rest } = props;

	return <AriaMenuSeparator {...rest} className={MenuSeparatorStyles({ className })} />;
}
