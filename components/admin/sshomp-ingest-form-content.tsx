"use client";

import { type ReactNode, useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { ingestDataFromSshompAction } from "@/lib/actions/admin/sshomp";
import { createKey } from "@/lib/create-key";

export function AdminSshompIngestFormContent(): ReactNode {
	const [formState, formAction] = useActionState(ingestDataFromSshompAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<SubmitButton>Ingest</SubmitButton>

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
