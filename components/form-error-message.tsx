import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import type { ActionState } from "@/lib/server/actions";

interface FormErrorMessageProps {
	className?: string;
	state: ActionState;
}

export function FormErrorMessage(props: FormErrorMessageProps): ReactNode {
	const { className, state, ...rest } = props;

	return (
		<div
			{...rest}
			aria-atomic={true}
			aria-live="assertive"
			className={cn(className, { "sr-only": state.status !== "error" })}
		>
			<div key={state.timestamp}>{state.status === "error" ? state.message : null}</div>
		</div>
	);
}
