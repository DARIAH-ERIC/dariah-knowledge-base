import {
	composeRenderProps,
	OverlayArrow as AriaPopoverArrow,
	type OverlayArrowProps as AriaPopoverArrowProps,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
} from "react-aria-components";

import { type VariantProps, variants } from "@/lib/styles";

export const popoverStyles = variants({
	base: [
		"group w-[280px] rounded-lg bg-white ring-1 ring-black/10 drop-shadow-lg placement-top:mb-2 placement-bottom:mt-2",
	],
	variants: {
		isEntering: {
			true: "duration-200 ease-out animate-in fade-in placement-top:slide-in-from-bottom-1 placement-bottom:slide-in-from-top-1",
		},
		isExiting: {
			true: "duration-150 ease-in animate-out fade-out placement-top:slide-out-to-bottom-1 placement-bottom:slide-out-to-top-1",
		},
	},
});

export type PopoverStyles = VariantProps<typeof popoverStyles>;

export interface PopoverProps extends AriaPopoverProps, PopoverStyles {}

export function Popover(props: PopoverProps) {
	const { children, className, ...rest } = props;

	return (
		<AriaPopover
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return popoverStyles({ ...renderProps, className });
			})}
		>
			{children}
		</AriaPopover>
	);
}

export const popoverArrowStyles = variants({
	base: [],
});

export type PopoverArrowStyles = VariantProps<typeof popoverArrowStyles>;

export interface PopoverArrowProps extends AriaPopoverArrowProps, PopoverArrowStyles {}

export function PopoverArrow(props: PopoverArrowProps) {
	const { className, ...rest } = props;

	return (
		<AriaPopoverArrow
			{...rest}
			className={composeRenderProps(className, (className, renderProps) => {
				return popoverArrowStyles({ ...renderProps, className });
			})}
		>
			<svg
				className="block size-4 fill-neutral-0 group-placement-bottom:rotate-180"
				height={12}
				viewBox="0 0 12 12"
				width={12}
			>
				<path d="M0 0L6 6L12 0" />
			</svg>
		</AriaPopoverArrow>
	);
}
