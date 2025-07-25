"use client";

import { isNonEmptyString } from "@acdh-oeaw/lib";
import { type ReactNode, useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { TextInputField } from "@/components/ui/blocks/text-input-field";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { signInAction } from "@/lib/actions/auth";
import { createKey } from "@/lib/create-key";

interface SignInFormContentProps {
	callbackUrl: string | null;
	emailLabel: string;
	passwordLabel: string;
	signInLabel: string;
}

export function SignInFormContent(props: SignInFormContentProps): ReactNode {
	const { callbackUrl, emailLabel, passwordLabel, signInLabel } = props;

	const [formState, formAction] = useActionState(signInAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid min-w-80 gap-4"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<TextInputField isRequired={true} label={emailLabel} name="email" type="email" />

			<TextInputField isRequired={true} label={passwordLabel} name="password" type="password" />

			{isNonEmptyString(callbackUrl) ? (
				<input name="redirectTo" type="hidden" value={callbackUrl} />
			) : null}

			<SubmitButton>{signInLabel}</SubmitButton>

			<FormSuccessMessage key={createKey("form-success", formState?.timestamp)}>
				{formState?.status === "success" && formState.message.length > 0 ? formState.message : null}
			</FormSuccessMessage>

			<FormErrorMessage key={createKey("form-error", formState?.timestamp)}>
				{formState?.status === "error" && formState.formErrors.length > 0
					? formState.formErrors
					: null}
			</FormErrorMessage>
		</Form>
	);
}
