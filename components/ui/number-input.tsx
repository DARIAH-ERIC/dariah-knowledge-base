"use client";

import { Input, type InputProps } from "@/components/ui/input";
import { type VariantProps, variants } from "@/lib/styles";

export const numberInputStyles = variants({
	base: [],
});

export type NumberInputStyles = VariantProps<typeof numberInputStyles>;

export interface NumberInputProps extends InputProps, NumberInputStyles {}

export function NumberInput(props: NumberInputProps) {
	const { children, className, ...rest } = props;

	return (
		<Input {...rest} className={numberInputStyles({ className })}>
			{children}
		</Input>
	);
}
