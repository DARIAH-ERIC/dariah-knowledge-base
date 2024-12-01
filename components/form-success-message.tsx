import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import type { ActionState } from "@/lib/server/actions";

interface FormSuccessMessageProps {
	className?: string;
	state: ActionState;
}

export function FormSuccessMessage(props: FormSuccessMessageProps): ReactNode {
	const { className, state, ...rest } = props;

	return (
		<div
			{...rest}
			aria-atomic={true}
			aria-live="polite"
			className={cn(className, { "sr-only": state.status !== "success" })}
		>
			<div key={state.timestamp}>{state.status === "success" ? state.message : null}</div>
		</div>
	);
}
