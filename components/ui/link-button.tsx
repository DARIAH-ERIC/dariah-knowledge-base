"use client";

/**
 * Intentionally not using `react-aria-components`'s `<Link>`, because that does not yet
 * support prefetching.
 */
import { Link, type LinkProps } from "@/components/link";
import { TouchTarget } from "@/components/ui/touch-target";
import { type VariantProps, variants } from "@/lib/styles";

export const linkButtonStyles = variants({
	base: [
		"relative inline-flex cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap transition",
		"rounded-md px-3 py-1.5",
		"text-sm font-medium leading-normal",
		"border",

		"disabled:opacity-50",
	],
	variants: {
		variant: {
			solid: [
				"border-neutral-950/90 dark:border-neutral-0/5",
				"bg-neutral-900 text-neutral-0 dark:bg-neutral-600",
				"hover:bg-neutral-900/90 dark:hover:bg-neutral-600/90",
				"shadow-xs dark:shadow-none",
				"disabled:shadow-none",
			],
			outline: [
				"border-neutral-950/10 dark:border-neutral-0/15",
				"bg-transparent hover:bg-neutral-950/2.5 pressed:bg-neutral-950/2.5 dark:hover:bg-neutral-0/2.5 dark:pressed:bg-neutral-950/2.5",
				"text-neutral-950 dark:text-neutral-0",
			],
			plain: [
				"border-transparent",
				"hover:bg-neutral-950/5 pressed:bg-neutral-950/5",
				"text-neutral-950 dark:text-neutral-0",
				"dark:hover:bg-neutral-0/10 dark:pressed:bg-neutral-0/10",
			],
		},
	},
	defaultVariants: {
		variant: "solid",
	},
});

export type LinkButtonStyles = VariantProps<typeof linkButtonStyles>;

export interface ButtonProps extends LinkProps, LinkButtonStyles {}

export function LinkButton(props: ButtonProps) {
	const { children, className, variant, ...rest } = props;

	return (
		<Link {...rest} className={linkButtonStyles({ className, variant })}>
			<TouchTarget>{children}</TouchTarget>
		</Link>
	);
}
