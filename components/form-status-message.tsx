import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import type { ActionState } from "@/lib/server/actions";

interface FormStatusMessageProps {
	state: ActionState;
}

export function FormStatusMessage(props: FormStatusMessageProps): ReactNode {
	const { state } = props;

	return (
		<div>
			<div
				aria-atomic={true}
				aria-live="polite"
				className={cn("text-small font-strong text-text-success", {
					"sr-only": state.status !== "success",
				})}
			>
				{state.status === "success" ? state.message : null}
			</div>
			<div
				aria-atomic={true}
				aria-live="assertive"
				className={cn("text-small font-strong text-text-error", {
					"sr-only": state.status !== "error",
				})}
			>
				{state.status === "error" ? state.message : null}
			</div>
		</div>
	);
}
