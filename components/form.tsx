import "client-only";

import type { ReactNode } from "react";
import { Form as AriaForm, type FormProps as AriaFormProps } from "react-aria-components";
import { useFormState as useActionState } from "react-dom";

import { type ActionState, createInitialActionState } from "@/lib/server/actions";
import { useRenderProps } from "@/lib/use-render-props";

interface FormProps extends Omit<AriaFormProps, "action"> {
	action: (state: ActionState, formData: FormData) => Promise<ActionState>;
	children: ReactNode;
}

export function Form(props: FormProps): ReactNode {
	const { action } = props;

	const [state, formAction] = useActionState(action, createInitialActionState({}));

	// TODO:
	// Alternatively, consider a custom context provider - `ActionStateContext` - which
	// can e.g. be read in `FormStatusMessage`.
	const renderProps = useRenderProps({
		...props,
		values: {
			state,
		},
	});

	return (
		<AriaForm {...renderProps} action={formAction}>
			{renderProps.children}
		</AriaForm>
	);
}
