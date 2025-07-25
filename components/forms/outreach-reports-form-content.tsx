"use client";

import { keyByToMap } from "@acdh-oeaw/lib";
import {
	type Country,
	type Outreach,
	type OutreachKpi,
	OutreachKpiType,
	OutreachType,
	type Prisma,
	type Report,
} from "@prisma/client";
import { useListData } from "@react-stately/data";
import { PlusIcon } from "lucide-react";
import { Fragment, type ReactNode, useActionState, useId } from "react";
import { Group } from "react-aria-components";

import { SubmitButton } from "@/components/submit-button";
import { ContextualHelp } from "@/components/ui/blocks/contextual-help";
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
import { createOutreachAction } from "@/lib/actions/create-outreach";
import { updateOutreachReportsAction } from "@/lib/actions/update-outreach-reports";
import { createKey } from "@/lib/create-key";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

interface OutreachReportWithKpis
	extends Prisma.OutreachReportGetPayload<{ include: { kpis: true; outreach: true } }> {}

interface OutreachReportsFormContentProps {
	comments: ReportCommentsSchema["outreach"];
	countryId: Country["id"];
	outreachReports: Array<OutreachReportWithKpis>;
	outreachs: Array<Outreach>;
	previousOutreachReports: Array<OutreachReportWithKpis> | null;
	previousReportId: Report["id"] | undefined;
	reportId: Report["id"];
}

export function OutreachReportsFormContent(props: OutreachReportsFormContentProps): ReactNode {
	const {
		comments,
		countryId,
		outreachReports,
		outreachs,
		// previousOutreachReports,
		// previousReportId,
		reportId,
	} = props;

	const [formState, formAction] = useActionState(updateOutreachReportsAction, undefined);

	const outreachReportsByOutreachId = keyByToMap(outreachReports, (outreachReport) => {
		return outreachReport.outreach.id;
	});

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="reportId" type="hidden" value={reportId} />

			<section className="grid gap-y-6">
				{outreachs.map((outreach, index) => {
					const outreachReport = outreachReportsByOutreachId.get(outreach.id);
					const kpis = outreachReport?.kpis;

					return (
						<Group key={outreach.id} className="grid content-start gap-y-6">
							<input
								name={`outreachReports.${String(index)}.outreach.id`}
								type="hidden"
								value={outreach.id}
							/>

							{outreachReport?.id != null ? (
								<input
									name={`outreachReports.${String(index)}.id`}
									type="hidden"
									value={outreachReport.id}
								/>
							) : null}

							<div className="grid gap-x-4 gap-y-3 sm:grid-cols-[1fr_1fr]">
								<TextInputField
									defaultValue={outreach.name}
									isReadOnly={true}
									label="Name"
									name={`outreachReports.${String(index)}.outreach.name`}
								/>

								<TextInputField
									defaultValue={outreach.url}
									isReadOnly={true}
									label="URL"
									name={`outreachReports.${String(index)}.outreach.url`}
								/>
							</div>

							<OutreachKpiList
								key={formState?.timestamp}
								kpis={kpis}
								name={`outreachReports.${String(index)}`}
								outreachType={outreach.type}
							/>

							<hr />
						</Group>
					);
				})}
			</section>

			<AddedOutreachsSection key={formState?.timestamp} country={countryId} />

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

interface OutreachKpiListProps {
	kpis: Array<OutreachKpi> | undefined;
	name: string;
	outreachType: OutreachType;
}

function OutreachKpiList(props: OutreachKpiListProps): ReactNode {
	const { kpis: initialKpis, name: prefix, outreachType } = props;

	const outreachKpiTypes = Object.values(OutreachKpiType);

	const kpis = useListData<Partial<OutreachKpi> & { _id?: string }>({
		initialItems:
			initialKpis ??
			(outreachType === "national_website"
				? defaultWebsiteOutreachKpis
				: defaultSocialMediaOutreachKpis),
		// getKey(item) {
		// 	return item.id ?? item._id;
		// },
	});

	return (
		<div className="grid gap-y-6">
			{kpis.items.length > 0 ? (
				<ul className="flex flex-wrap gap-x-4 gap-y-6" role="list">
					{kpis.items.map((kpi, index) => {
						return (
							<li key={kpi.id ?? kpi._id}>
								<Group className="grid gap-y-3">
									{kpi.id != null ? (
										<input
											name={`${prefix}.kpis.${String(index)}.id`}
											type="hidden"
											value={kpi.id}
										/>
									) : null}

									<SelectField
										defaultSelectedKey={kpi.unit}
										isRequired={true}
										label="Unit"
										name={`${prefix}.kpis.${String(index)}.unit`}
									>
										{outreachKpiTypes.map((type) => {
											return (
												<SelectItem key={type} id={type} textValue={type}>
													{type}
												</SelectItem>
											);
										})}
									</SelectField>

									<NumberInputField
										defaultValue={kpi.value ?? 0}
										isRequired={true}
										label="Value"
										name={`${prefix}.kpis.${String(index)}.value`}
									/>
								</Group>
							</li>
						);
					})}
				</ul>
			) : null}

			<div className="flex items-center gap-x-2">
				<Button
					onPress={() => {
						kpis.append({ _id: crypto.randomUUID() });
					}}
				>
					Add KPI
				</Button>

				<ContextualHelp
					description="Click here to add a KPI for a DARIAH National outreach platform."
					title="Help"
					trigger="Help"
				/>
			</div>
		</div>
	);
}

/** Pre-selected outreach kpis for "national_website" outreach type. */
const defaultWebsiteOutreachKpis: Array<{ _id: string; unit: OutreachKpi["unit"] }> = [
	{ _id: crypto.randomUUID(), unit: "page_views" },
	{ _id: crypto.randomUUID(), unit: "unique_visitors" },
];

/** Pre-selected outreach kpis for "social_media" outreach type. */
const defaultSocialMediaOutreachKpis: Array<{ _id: string; unit: OutreachKpi["unit"] }> = [
	{ _id: crypto.randomUUID(), unit: "engagement" },
	{ _id: crypto.randomUUID(), unit: "followers" },
	{ _id: crypto.randomUUID(), unit: "impressions" },
];

interface AddedOutreachsSectionProps {
	country: string;
}

function AddedOutreachsSection(props: AddedOutreachsSectionProps): ReactNode {
	const { country } = props;

	return (
		<section className="grid gap-y-6">
			<div className="flex items-center gap-x-2">
				<DialogTrigger>
					<Button>
						<PlusIcon aria-hidden={true} className="size-4 shrink-0" />
						Add outreach
					</Button>

					<CreateOutreachFormDialog country={country} />
				</DialogTrigger>
			</div>
		</section>
	);
}

interface CreateOutreachFormDialogProps {
	country: string;
}

function CreateOutreachFormDialog(props: CreateOutreachFormDialogProps): ReactNode {
	const { country } = props;

	const formId = useId();

	const outreachTypes = Object.values(OutreachType);

	// FIXME: only close dialog when submit was successful.
	const [_formState, formAction] = useActionState(createOutreachAction, undefined);

	return (
		<ModalOverlay>
			<Modal isDismissable={true}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create outreach</DialogTitle>
									<DialogDescription>Please provide outreach details.</DialogDescription>
								</DialogHeader>

								<div>
									<Form
										action={(formData) => {
											formAction(formData);
											close();
										}}
										className="grid gap-y-4"
										id={formId}
									>
										<input name="country" type="hidden" value={country} />

										<TextInputField autoFocus={true} isRequired={true} label="Name" name="name" />

										<TextInputField isRequired={true} label="URL" name="url" type="url" />

										<SelectField isRequired={true} label="Type" name="type">
											{outreachTypes.map((type) => {
												return (
													<SelectItem key={type} id={type} textValue={type}>
														{type}
													</SelectItem>
												);
											})}
										</SelectField>

										<DateInputField granularity="day" label="Start date" name="startDate" />
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
