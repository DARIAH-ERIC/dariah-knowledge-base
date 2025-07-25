"use client";

import type { Report } from "@prisma/client";
import { type ReactNode, useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { TextAreaField } from "@/components/ui/blocks/text-area-field";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { updatePublicationsAction } from "@/lib/actions/update-publications";
import { createKey } from "@/lib/create-key";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

interface PublicationsFormContentProps {
	bibliography: string;
	comments: ReportCommentsSchema["publications"];
	reportId: Report["id"];
	total: number;
	year: number;
}

export function PublicationsFormContent(props: PublicationsFormContentProps): ReactNode {
	const { bibliography, comments, reportId, total, year } = props;

	const [formState, formAction] = useActionState(updatePublicationsAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="reportId" type="hidden" value={reportId} />

			{total > 0 ? (
				<div
					dangerouslySetInnerHTML={{ __html: bibliography }}
					className="max-w-(--breakpoint-md) text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 [&_.csl-bib-body]:flex [&_.csl-bib-body]:flex-col [&_.csl-bib-body]:gap-y-2 [&_.csl-entry]:pl-4 [&_.csl-entry]:-indent-4"
				/>
			) : (
				<div className="grid place-items-center py-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
					No entries found for {year} in your zotero collection.
				</div>
			)}

			<TextAreaField defaultValue={comments} label="Comment" name="comment" />

			<SubmitButton>Save and continue</SubmitButton>

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
