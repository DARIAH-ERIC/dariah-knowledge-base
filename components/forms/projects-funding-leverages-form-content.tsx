"use client";

import { ProjectScope, type ProjectsFundingLeverage, type Report } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { PlusIcon } from "lucide-react";
import { Fragment, type ReactNode, useActionState, useId } from "react";
import { Group } from "react-aria-components";

import { SubmitButton } from "@/components/submit-button";
import { DateInputField } from "@/components/ui/blocks/date-input-field";
import { NumberInputField } from "@/components/ui/blocks/number-input-field";
import { SelectField, SelectItem } from "@/components/ui/blocks/select-field";
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
import { updateProjectsFundingLeveragesAction } from "@/lib/actions/update-projects-funding-leverages";
import { createKey } from "@/lib/create-key";
import { getFormData } from "@/lib/get-form-data";
import type { ReportCommentsSchema } from "@/lib/schemas/report";
import { toDateValue } from "@/lib/to-date-value";

interface AddedProjectsFundingLeverage {
	_id: string;
	name: string;
	startDate: string;
	projectMonths: number;
	amount: number;
	funders: string;
	scope: string;
}

type ProjectsFundingLeverageSerialized = Omit<ProjectsFundingLeverage, "amount"> & {
	amount: number | undefined;
};

interface ProjectsFundingLeveragesFormContentProps {
	comments: ReportCommentsSchema["projectFundingLeverages"];
	previousProjectsFundingLeverages: Array<ProjectsFundingLeverageSerialized> | null;
	previousReportId: Report["id"] | undefined;
	projectsFundingLeverages: Array<ProjectsFundingLeverageSerialized>;
	reportId: Report["id"];
}

export function ProjectsFundingLeveragesFormContent(
	props: ProjectsFundingLeveragesFormContentProps,
): ReactNode {
	const {
		comments,
		// previousProjectsFundingLeverages,
		// previousReportId,
		projectsFundingLeverages,
		reportId,
	} = props;

	const [formState, formAction] = useActionState(updateProjectsFundingLeveragesAction, undefined);

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="reportId" type="hidden" value={reportId} />

			<section className="grid gap-y-6">
				{projectsFundingLeverages.map((projectsFundingLeverage, index) => {
					return (
						<Group
							key={projectsFundingLeverage.id}
							className="grid content-start gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-6"
						>
							<input
								name={`projectsFundingLeverages.${String(index)}.id`}
								type="hidden"
								value={projectsFundingLeverage.id}
							/>

							<TextInputField
								defaultValue={projectsFundingLeverage.name}
								isReadOnly={true}
								label="Name"
								name={`projectsFundingLeverages.${String(index)}.name`}
							/>

							<DateInputField
								defaultValue={
									projectsFundingLeverage.startDate != null
										? toDateValue(projectsFundingLeverage.startDate)
										: undefined
								}
								granularity="day"
								isReadOnly={true}
								label="Start date"
								name={`projectsFundingLeverages.${String(index)}.startDate`}
							/>

							<NumberInputField
								defaultValue={projectsFundingLeverage.projectMonths ?? undefined}
								isReadOnly={true}
								label="Project months"
								name={`projectsFundingLeverages.${String(index)}.projectMonths`}
							/>

							<NumberInputField
								defaultValue={Number(projectsFundingLeverage.amount)}
								formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
								isReadOnly={true}
								label="Total amount"
								name={`projectsFundingLeverages.${String(index)}.amount`}
							/>

							<TextInputField
								defaultValue={projectsFundingLeverage.funders ?? undefined}
								isReadOnly={true}
								label="Funder"
								name={`projectsFundingLeverages.${String(index)}.funders`}
							/>

							<TextInputField
								defaultValue={projectsFundingLeverage.scope ?? undefined}
								isReadOnly={true}
								label="Scope"
								name={`projectsFundingLeverages.${String(index)}.scope`}
							/>
						</Group>
					);
				})}
			</section>

			<hr />

			<AddedProjectsFundingLeveragesSection key={formState?.timestamp} />

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
function AddedProjectsFundingLeveragesSection(): ReactNode {
	const addedProjectsFundingLeverages = useListData<AddedProjectsFundingLeverage>({
		initialItems: [],
		getKey(item) {
			return item._id;
		},
	});

	return (
		<section className="grid gap-y-6">
			{addedProjectsFundingLeverages.items.map((addedProjectsFundingLeverage, index) => {
				return (
					<Group
						key={addedProjectsFundingLeverage._id}
						className="grid content-start gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-6"
					>
						<TextInputField
							defaultValue={addedProjectsFundingLeverage.name}
							isReadOnly={true}
							label="Name"
							name={`addedProjectsFundingLeverages.${String(index)}.name`}
						/>

						<DateInputField
							defaultValue={toDateValue(addedProjectsFundingLeverage.startDate)}
							granularity="day"
							isReadOnly={true}
							label="Start date"
							name={`addedProjectsFundingLeverages.${String(index)}.startDate`}
						/>

						<NumberInputField
							defaultValue={addedProjectsFundingLeverage.projectMonths}
							isReadOnly={true}
							label="Project months"
							name={`addedProjectsFundingLeverages.${String(index)}.projectMonths`}
						/>

						<NumberInputField
							defaultValue={Number(addedProjectsFundingLeverage.amount)}
							isReadOnly={true}
							label="Total amount"
							name={`addedProjectsFundingLeverages.${String(index)}.amount`}
						/>

						<TextInputField
							defaultValue={addedProjectsFundingLeverage.funders}
							isReadOnly={true}
							label="Funders"
							name={`addedProjectsFundingLeverages.${String(index)}.funders`}
						/>

						<TextInputField
							defaultValue={addedProjectsFundingLeverage.scope}
							isReadOnly={true}
							label="Scope"
							name={`addedProjectsFundingLeverages.${String(index)}.scope`}
						/>
					</Group>
				);
			})}

			<div>
				<DialogTrigger>
					<Button>
						<PlusIcon aria-hidden={true} className="size-4 shrink-0" />
						Add project funding
					</Button>

					<CreateProjectsFundingLeverageFormDialog
						action={(formData, close) => {
							const projectFundingLeverage = getFormData(formData) as AddedProjectsFundingLeverage;

							addedProjectsFundingLeverages.append(projectFundingLeverage);

							close();
						}}
					/>
				</DialogTrigger>
			</div>
		</section>
	);
}

interface CreateProjectsFundingLeverageFormDialogProps {
	action: (formData: FormData, close: () => void) => void;
}

function CreateProjectsFundingLeverageFormDialog(
	props: CreateProjectsFundingLeverageFormDialogProps,
): ReactNode {
	const { action } = props;

	const scopes = Object.values(ProjectScope);

	const formId = useId();

	return (
		<ModalOverlay>
			<Modal isDismissable={true}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create projects funding leverage</DialogTitle>
									<DialogDescription>
										Please provide projects funding leverage details.
									</DialogDescription>
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

										<DateInputField
											granularity="day"
											isRequired={true}
											label="Start date"
											name="startDate"
										/>

										<NumberInputField
											isRequired={true}
											label="Project months"
											name="projectMonths"
										/>

										<NumberInputField isRequired={true} label="Total amount" name="amount" />

										<TextInputField isRequired={true} label="Funders" name="funders" />

										<SelectField isRequired={true} label="Scope" name="scope">
											{scopes.map((scope) => {
												return (
													<SelectItem key={scope} id={scope} textValue={scope}>
														{scope}
													</SelectItem>
												);
											})}
										</SelectField>
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
