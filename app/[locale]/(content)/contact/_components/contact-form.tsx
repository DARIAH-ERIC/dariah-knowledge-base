"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Button, Input, Label, TextArea, TextField } from "react-aria-components";
import { useFormStatus } from "react-dom";

import { sendContactFormEmailAction } from "@/app/[locale]/(content)/contact/_actions/send-contact-form-email-action";
import { Form } from "@/components/form";

export function ContactForm(): ReactNode {
	const t = useTranslations("ContactForm");

	return (
		<Form action={sendContactFormEmailAction}>
			<TextField
				autoComplete="email"
				className="grid gap-y-1"
				isRequired={true}
				name="email"
				type="email"
			>
				<Label className="text-small text-text-strong">{t("email")}</Label>
				<Input className="min-h-12 rounded-2 border px-4 py-2.5 text-small text-text-strong" />
			</TextField>

			<TextField className="grid gap-y-1" isRequired={true} name="subject">
				<Label className="text-small text-text-strong">{t("subject")}</Label>
				<Input className="min-h-12 rounded-2 border px-4 py-2.5 text-small text-text-strong" />
			</TextField>

			<TextField className="grid gap-y-1" isRequired={true} name="message">
				<Label className="text-small text-text-strong">{t("message")}</Label>
				<TextArea
					className="min-h-12 rounded-2 border px-4 py-2.5 text-small text-text-strong"
					rows={5}
				/>
			</TextField>

			<div>
				<SubmitButton>{t("submit")}</SubmitButton>
			</div>
		</Form>
	);
}

interface SubmitButtonProps {
	children: ReactNode;
}

function SubmitButton(props: SubmitButtonProps): ReactNode {
	const { children } = props;

	const { pending: isFormPending } = useFormStatus();

	return (
		<Button
			className={cn(
				"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-5 py-2.5 text-small font-strong text-text-inverse-strong shadow-raised",
				"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
			)}
			isPending={isFormPending}
			type="submit"
		>
			{children}
		</Button>
	);
}
