"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { type ReactNode, useActionState } from "react";
import { Input, Label, TextArea, TextField } from "react-aria-components";

import { sendContactFormEmailAction } from "@/app/[locale]/(content)/contact/_actions/send-contact-form-email-action";
import { Form } from "@/components/form";
import { FormErrorMessage } from "@/components/form-error-message";
import { FormSuccessMessage } from "@/components/form-success-message";
import { SubmitButton } from "@/components/submit-button";
import { createInitialActionState } from "@/lib/server/actions";

interface ContactFormContentProps {
	emailLabel: string;
	messageLabel: string;
	subjectLabel: string;
	submitLabel: string;
}

export function ContactFormContent(props: ContactFormContentProps): ReactNode {
	const { emailLabel, messageLabel, subjectLabel, submitLabel } = props;

	const [state, action] = useActionState(sendContactFormEmailAction, createInitialActionState({}));

	return (
		<Form action={action}>
			<div>
				<FormErrorMessage className="text-small font-strong text-text-error" state={state} />
				<FormSuccessMessage className="text-small font-strong text-text-success" state={state} />
			</div>

			<TextField
				autoComplete="email"
				className="grid gap-y-1"
				isRequired={true}
				name="email"
				type="email"
			>
				<Label className="text-small text-text-strong">{emailLabel}</Label>
				<Input className="min-h-12 rounded-2 border px-4 py-2.5 text-small text-text-strong" />
			</TextField>

			<TextField className="grid gap-y-1" isRequired={true} name="subject">
				<Label className="text-small text-text-strong">{subjectLabel}</Label>
				<Input className="min-h-12 rounded-2 border px-4 py-2.5 text-small text-text-strong" />
			</TextField>

			<TextField className="grid gap-y-1" isRequired={true} name="message">
				<Label className="text-small text-text-strong">{messageLabel}</Label>
				<TextArea
					className="min-h-12 rounded-2 border px-4 py-2.5 text-small text-text-strong"
					rows={5}
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
