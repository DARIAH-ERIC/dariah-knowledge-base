"use client";

import type { Country, Institution, Report } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { PlusIcon } from "lucide-react";
import { Fragment, type ReactNode, useActionState, useId } from "react";
import { Group } from "react-aria-components";

import { SubmitButton } from "@/components/submit-button";
import { ContextualHelp } from "@/components/ui/blocks/contextual-help";
import { Radio, RadioGroupField } from "@/components/ui/blocks/radio-group-field";
import { TextAreaField } from "@/components/ui/blocks/text-area-field";
import { TextInputField } from "@/components/ui/blocks/text-input-field";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogCancelButton,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { Modal, ModalOverlay } from "@/components/ui/modal";
import { updateInstitutionsAction } from "@/lib/actions/update-institutions";
import { createKey } from "@/lib/create-key";
import { getFormData } from "@/lib/get-form-data";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

interface AddedInstitution {
	_id: string;
	name: string;
}

interface InstitutionsFormContentProps {
	comments: ReportCommentsSchema["institutions"];
	countryId: Country["id"];
	institutions: Array<Institution>;
	reportId: Report["id"];
	year: number;
}

export function InstitutionsFormContent(props: InstitutionsFormContentProps): ReactNode {
	const { comments, countryId, institutions, reportId, year } = props;

	const [formState, formAction] = useActionState(updateInstitutionsAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="reportId" type="hidden" value={reportId} />

			<input name="countryId" type="hidden" value={countryId} />

			<input name="year" type="hidden" value={year} />

			<section className="grid gap-y-6">
				{institutions.map((institution, index) => {
					return (
						<Group
							key={institution.id}
							className="grid content-start gap-x-4 gap-y-3 sm:grid-cols-[1fr_auto_auto]"
						>
							<input
								name={`institutions.${String(index)}.id`}
								type="hidden"
								value={institution.id}
							/>

							<TextInputField
								defaultValue={institution.name}
								isReadOnly={true}
								label="Name"
								name={`institutions.${String(index)}.name`}
							/>

							<TextInputField
								defaultValue={institution.types.join(", ")}
								isReadOnly={true}
								label="Type"
								// name={`institutions.${String(index)}.types`}
							/>

							<RadioGroupField
								defaultValue="active"
								label="Status"
								name={`institutions.${String(index)}.status`}
								orientation="horizontal"
							>
								<Radio value="active">Still active</Radio>
								<Radio value="inactive">No longer part of the consortium</Radio>
							</RadioGroupField>
						</Group>
					);
				})}
			</section>

			<hr />

			<AddedInstitutionsSection key={formState?.timestamp} />

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

function AddedInstitutionsSection(): ReactNode {
	const addedInstitutions = useListData<AddedInstitution>({
		initialItems: [],
		getKey(item) {
			return item._id;
		},
	});

	return (
		<section className="grid gap-y-6">
			{addedInstitutions.items.map((institution, index) => {
				return (
					<Group key={institution._id} className="grid content-start gap-x-4">
						<TextInputField
							defaultValue={institution.name}
							isReadOnly={true}
							label="Name"
							name={`addedInstitutions.${String(index)}.name`}
						/>
					</Group>
				);
			})}

			<div className="flex items-center gap-x-2">
				<DialogTrigger>
					<Button>
						<PlusIcon aria-hidden={true} className="size-4 shrink-0" />
						Add institution
					</Button>

					<CreateInstitutionFormDialog
						action={(formData, close) => {
							const institution = getFormData(formData) as AddedInstitution;

							addedInstitutions.append(institution);

							close();
						}}
					/>
				</DialogTrigger>

				<ContextualHelp
					description="Click here to add a partner institution for your DARIAH national consortium."
					title="Help"
					trigger="Help"
				/>
			</div>
		</section>
	);
}

interface CreateInstitutionFormDialogProps {
	action: (formData: FormData, close: () => void) => void;
}

function CreateInstitutionFormDialog(props: CreateInstitutionFormDialogProps): ReactNode {
	const { action } = props;

	const formId = useId();

	return (
		<ModalOverlay>
			<Modal isDismissable={true}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create institution</DialogTitle>
									<DialogDescription>Please provide institution details.</DialogDescription>
								</DialogHeader>

								<div>
									<Form
										action={(formData) => {
											action(formData, close);
										}}
										className="grid gap-y-6"
										id={formId}
									>
										<input name="_id" type="hidden" value={crypto.randomUUID()} />

										<TextInputField autoFocus={true} isRequired={true} label="Name" name="name" />
									</Form>
								</div>

								<DialogFooter>
									<DialogCancelButton>Cancel</DialogCancelButton>
									<SubmitButton form={formId}>Create</SubmitButton>
								</DialogFooter>
							</Fragment>
						);
					}}
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
