"use client";

import type { Report, ResearchPolicyDevelopment } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { type ReactNode, useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { TextAreaField } from "@/components/ui/blocks/text-area-field";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { updateResearchPolicyDevelopmentsAction } from "@/lib/actions/update-research-policy-developments";
import { createKey } from "@/lib/create-key";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

interface AddedResearchPolicyDevelopment {
	_id: string;
	name: string;
}

interface ResearchPolicyDevelopmentsFormContentProps {
	comments: ReportCommentsSchema["researchPolicyDevelopments"];
	previousReportId: Report["id"] | undefined;
	previousResearchPolicyDevelopments: Array<ResearchPolicyDevelopment> | null;
	reportId: Report["id"];
	researchPolicyDevelopments: Array<ResearchPolicyDevelopment>;
}

export function ResearchPolicyDevelopmentsFormContent(
	props: ResearchPolicyDevelopmentsFormContentProps,
): ReactNode {
	const {
		comments,
		// previousReportId,
		// previousResearchPolicyDevelopments,
		reportId,
		// researchPolicyDevelopments,
	} = props;

	const [formState, formAction] = useActionState(updateResearchPolicyDevelopmentsAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="reportId" type="hidden" value={reportId} />

			<AddedResearchPolicyDevelopmentsSection key={formState?.timestamp} />

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

function AddedResearchPolicyDevelopmentsSection(): ReactNode {
	const _addedResearchPolicyDevelopments = useListData<AddedResearchPolicyDevelopment>({
		initialItems: [],
		getKey(item) {
			return item._id;
		},
	});

	return null;
}
