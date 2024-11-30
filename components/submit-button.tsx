"use client";

import type { ReactNode } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps extends ButtonProps {
	children: ReactNode;
}

export function SubmitButton(props: SubmitButtonProps): ReactNode {
	const { children } = props;

	const { pending: isPending } = useFormStatus();

	return (
		<Button isPending={isPending} type="submit">
			{children}
		</Button>
	);
}
