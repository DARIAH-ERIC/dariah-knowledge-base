"use client";

import type { Country, Report } from "@prisma/client";
import { type ReactNode, useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { updateReportStatusAction } from "@/lib/actions/update-report-status";
import { createKey } from "@/lib/create-key";

interface ConfirmationFormContentProps {
	countryId: Country["id"];
	isConfirmationAvailable: boolean;
	reportId: Report["id"];
}

export function ConfirmationFormContent(props: ConfirmationFormContentProps): ReactNode {
	const { countryId, isConfirmationAvailable, reportId } = props;

	const [formState, formAction] = useActionState(updateReportStatusAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="countryId" type="hidden" value={countryId} />

			<input name="reportId" type="hidden" value={reportId} />

			<SubmitButton isDisabled={!isConfirmationAvailable}>
				{isConfirmationAvailable ? "Confirm" : "Only national coordinators can submit confirmation"}
			</SubmitButton>

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
