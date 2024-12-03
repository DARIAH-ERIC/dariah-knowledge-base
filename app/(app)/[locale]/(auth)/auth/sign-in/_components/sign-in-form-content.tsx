"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { type ReactNode, useActionState } from "react";
import { FieldError, Input, Label, TextField } from "react-aria-components";

import { signInAction } from "@/app/(app)/[locale]/(auth)/auth/sign-in/_actions/sign-in-action";
import { Form } from "@/components/form";
import { FormErrorMessage } from "@/components/form-error-message";
import { FormSuccessMessage } from "@/components/form-success-message";
import { SubmitButton } from "@/components/submit-button";
import { createInitialActionState, getFieldErrors } from "@/lib/server/actions";
// import { Honeypot } from "@/lib/honeypot";

interface SignInFormContentProps {
	emailLabel: string;
	passwordLabel: string;
	submitLabel: string;
}

export function SignInFormContent(props: SignInFormContentProps): ReactNode {
	const { emailLabel, passwordLabel, submitLabel } = props;

	const [state, action] = useActionState(signInAction, createInitialActionState({}));

	return (
		<Form action={action} className="grid gap-y-8" validationErrors={getFieldErrors(state)}>
			<FormErrorMessage
				className="min-h-12 rounded-2 border border-stroke-error-weak bg-fill-error-weak px-4 py-2.5 text-small font-strong text-text-error"
				state={state}
			/>
			<FormSuccessMessage
				className="min-h-12 rounded-2 border border-stroke-success-weak bg-fill-success-weak px-4 py-2.5 text-small font-strong text-text-success"
				state={state}
			/>

			{/* <Honeypot /> */}

			<TextField
				autoComplete="email"
				className="grid gap-y-1"
				isRequired={true}
				name="email"
				type="email"
			>
				<Label className="text-small text-text-strong">{emailLabel}</Label>
				<FieldError className="text-small text-text-error" />
				<Input
					className={cn(
						"min-h-12 rounded-2 border border-stroke-strong bg-fill-inverse-strong px-4 py-2.5 text-small text-text-strong",
						"interactive focus:focus-outline hover:hover-overlay pressed:press-overlay",
						"invalid:border-stroke-error-strong invalid:bg-fill-error-weak",
					)}
				/>
			</TextField>

			<TextField
				autoComplete="current-password"
				className="grid gap-y-1"
				isRequired={true}
				name="password"
				type="password"
			>
				<Label className="text-small text-text-strong">{passwordLabel}</Label>
				<FieldError className="text-small text-text-error" />
				<Input
					className={cn(
						"min-h-12 rounded-2 border border-stroke-strong bg-fill-inverse-strong px-4 py-2.5 text-small text-text-strong",
						"interactive focus:focus-outline hover:hover-overlay pressed:press-overlay",
						"invalid:border-stroke-error-strong invalid:bg-fill-error-weak",
					)}
				/>
			</TextField>

			<div>
				<SubmitButton
					className={cn(
						"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-5 py-2.5 text-small font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
				>
					{submitLabel}
				</SubmitButton>
			</div>
		</Form>
	);
}
