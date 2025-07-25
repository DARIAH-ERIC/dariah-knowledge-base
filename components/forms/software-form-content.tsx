"use client";

import type { Country, Report, Software } from "@prisma/client";
import { type ReactNode, useActionState } from "react";
import { Group } from "react-aria-components";

import { SubmitButton } from "@/components/submit-button";
import { ContextualHelp } from "@/components/ui/blocks/contextual-help";
import { TextAreaField } from "@/components/ui/blocks/text-area-field";
import { TextInputField } from "@/components/ui/blocks/text-input-field";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { LinkButton } from "@/components/ui/link-button";
import { updateSoftwareAction } from "@/lib/actions/update-software";
import { createKey } from "@/lib/create-key";
import { createHref } from "@/lib/navigation/create-href";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

interface SoftwareFormContentProps {
	comments: ReportCommentsSchema["software"];
	countryId: Country["id"];
	reportId: Report["id"];
	softwares: Array<Software>;
	sshompBaseUrl: string;
}

export function SoftwareFormContent(props: SoftwareFormContentProps): ReactNode {
	const { comments, countryId, reportId, softwares, sshompBaseUrl } = props;

	const [formState, formAction] = useActionState(updateSoftwareAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="countryId" type="hidden" value={countryId} />

			<input name="reportId" type="hidden" value={reportId} />

			<section className="grid gap-y-6">
				{softwares.map((software, index) => {
					return (
						<Group
							key={software.id}
							className="grid content-start gap-x-4 gap-y-3 sm:grid-cols-[1fr_1fr]"
						>
							<input name={`software.${String(index)}.id`} type="hidden" value={software.id} />

							<TextInputField
								defaultValue={software.name}
								isReadOnly={true}
								label="Name"
								name={`software.${String(index)}.name`}
							/>

							<TextInputField
								defaultValue={software.url[0]}
								isReadOnly={true}
								label="URL"
								name={`software.${String(index)}.url.0`}
							/>
						</Group>
					);
				})}
			</section>

			<hr />

			<div className="flex items-center gap-x-2">
				<LinkButton
					href={createHref({
						baseUrl: sshompBaseUrl,
						pathname: "/tool-or-service/new",
					})}
					target="_blank"
				>
					Add new software
				</LinkButton>

				<ContextualHelp
					description="Click here to add a DARIAH National tool or service. You will be redirected to the SSH Open Marketplace."
					title="Help"
					trigger="Help"
				/>
			</div>

			<TextAreaField defaultValue={comments} label="Comment" name="comment" />

			<SubmitButton>Save and continue</SubmitButton>

			<FormSuccessMessage key={createKey("form-success", formState?.timestamp)}>
				{formState?.status === "success" ? formState.message : null}
			</FormSuccessMessage>

			<FormErrorMessage key={createKey("form-error", formState?.timestamp)}>
				{formState?.status === "error" && formState.formErrors.length > 0
					? formState.formErrors
					: null}
			</FormErrorMessage>
		</Form>
	);
}
