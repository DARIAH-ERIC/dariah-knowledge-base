"use client";

import type { ReactNode } from "react";
import { Form as AriaForm } from "react-aria-components";
import { useFormState as useActionState } from "react-dom";

import { type ActionResult, createInitialActionResult } from "@/lib/server/actions";

interface FormProps {
	action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
	children: ReactNode;
}

export function Form(props: FormProps): ReactNode {
	const { action, children } = props;

	const [state, formAction] = useActionState(action, createInitialActionResult({}));

	return (
		<AriaForm action={formAction} className="grid gap-y-12">
			{children}

			<div aria-atomic={true} aria-live="polite">
				{state.status === "error" ? (
					<div className="text-text-error">{state.message}</div>
				) : state.status === "success" ? (
					<div className="text-text-success">{state.message}</div>
				) : null}
			</div>
		</AriaForm>
	);
}
