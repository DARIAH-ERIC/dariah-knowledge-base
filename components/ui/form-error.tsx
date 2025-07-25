"use client";

import { AlertCircleIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useFormStatus } from "react-dom";

import { type VariantProps, variants } from "@/lib/styles";

export const formErrorStyles = variants({
	base: [
		"flex items-center gap-1.5 transition",
		"text-xs leading-normal text-negative-600 dark:text-negative-500",
		"disabled:opacity-50",
	],
	variants: {
		isEmpty: {
			true: "sr-only",
		},
	},
});

export type FormErrorStyles = VariantProps<typeof formErrorStyles>;

export interface FormErrorProps
	extends Omit<ComponentPropsWithoutRef<"div">, "aria-atomic" | "aria-live" | "aria-relevant">,
		FormErrorStyles {}

export function FormError(props: FormErrorProps) {
	const { children, className, ...rest } = props;

	/** TODO: Consider moving up a level once `useActionState` lands in `react`. */
	const { pending } = useFormStatus();

	/** Clear message when form submission is in flight. */
	const message = pending ? null : children;
	const isEmpty = message == null;

	return (
		<div
			{...rest}
			aria-atomic={true}
			aria-live="polite"
			aria-relevant="text"
			className={formErrorStyles({ className, isEmpty })}
		>
			{!isEmpty ? <AlertCircleIcon aria-hidden={true} className="size-4 shrink-0" /> : null}
			{message}
		</div>
	);
}
