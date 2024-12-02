"use client";

import type { ReactNode } from "react";
import { useFormState } from "react-dom";

import { regenerateRecoveryCodeAction } from "@/app/[locale]/auth/settings/_actions/regenerate-recovery-code-action";
import { Form } from "@/components/form";
import { FormErrorMessage } from "@/components/form-error-message";
import { FormSuccessMessage } from "@/components/form-success-message";
import { SubmitButton } from "@/components/submit-button";
import { createInitialActionState, getFieldErrors } from "@/lib/server/actions";
// import { Honeypot } from "@/lib/honeypot";

interface RecoveryCodeFormContentProps {
	generateNewCodeLabel: string;
	recoveryCode: string;
	yourCodeLabel: string;
}

export function RecoveryCodeFormContent(props: RecoveryCodeFormContentProps): ReactNode {
	const { generateNewCodeLabel, recoveryCode, yourCodeLabel } = props;

	const [state, action] = useFormState(regenerateRecoveryCodeAction, createInitialActionState({}));

	const newRecoveryCode =
		state.status === "success"
			? ((state.formData?.get("recovery-code") as string | null) ?? null)
			: null;

	return (
		<Form action={action} className="grid gap-y-8" validationErrors={getFieldErrors(state)}>
			<FormErrorMessage
				className="min-h-12 border border-stroke-error-weak bg-fill-error-weak px-4 py-2.5 text-small font-strong text-text-error"
				state={state}
			/>
			<FormSuccessMessage
				className="min-h-12 border border-stroke-success-weak bg-fill-success-weak px-4 py-2.5 text-small font-strong text-text-success"
				state={state}
			/>

			{/* <Honeypot /> */}

			<p>
				{yourCodeLabel} {newRecoveryCode ?? recoveryCode}
			</p>

			<SubmitButton>{generateNewCodeLabel}</SubmitButton>
		</Form>
	);
}
