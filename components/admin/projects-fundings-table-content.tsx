"use client";

import { type Prisma, ProjectScope } from "@prisma/client";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useFormatter } from "next-intl";
import { Fragment, type ReactNode, useActionState, useId, useMemo, useState } from "react";
import type { Key } from "react-aria-components";

import { Pagination } from "@/components/admin/pagination";
import { usePagination } from "@/components/admin/use-pagination";
import { SubmitButton } from "@/components/submit-button";
import { DateInputField } from "@/components/ui/blocks/date-input-field";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/blocks/dropdown-menu";
import { NumberInputField } from "@/components/ui/blocks/number-input-field";
import { SelectField, SelectItem } from "@/components/ui/blocks/select-field";
import { TextInputField } from "@/components/ui/blocks/text-input-field";
import {
	Dialog,
	DialogCancelButton,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormError as FormErrorMessage } from "@/components/ui/form-error";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { IconButton } from "@/components/ui/icon-button";
import { Modal, ModalOverlay } from "@/components/ui/modal";
import { Cell, Column, Row, Table, TableBody, TableHeader } from "@/components/ui/table";
import { deleteProjectFundingLeverageAction } from "@/lib/actions/admin/delete-project-funding-leverage";
import { updateProjectFundingLeverageAction } from "@/lib/actions/admin/update-project-funding-leverage";
import { createKey } from "@/lib/create-key";
import { toDateValue } from "@/lib/to-date-value";

type Action =
	| {
			kind: "delete";
			item: Prisma.ProjectsFundingLeverageGetPayload<{
				include: {
					report: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.ProjectsFundingLeverageGetPayload<{
				include: {
					report: { select: { id: true } };
				};
			}>;
	  };

interface AdminProjectsFundingsTableContentProps {
	projectsFundingLeverages: Array<
		Prisma.ProjectsFundingLeverageGetPayload<{
			include: {
				report: { select: { id: true } };
			};
		}>
	>;
}

export function AdminProjectsFundingsTableContent(
	props: AdminProjectsFundingsTableContentProps,
): ReactNode {
	const { projectsFundingLeverages } = props;

	const { dateTime, number } = useFormatter();

	const [action, setAction] = useState<Action | null>(null);

	function onDialogClose() {
		setAction(null);
	}

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as
			| "amount"
			| "funders"
			| "name"
			| "projectMonths"
			| "scope"
			| "startDate"
			| "totalAmount",
		direction: "ascending" as "ascending" | "descending",
	});

	const items = useMemo(() => {
		const items = projectsFundingLeverages.toSorted((a, z) => {
			switch (sortDescriptor.column) {
				case "amount":
				case "totalAmount": {
					const amountA = a[sortDescriptor.column] ?? 0;
					const amountZ = z[sortDescriptor.column] ?? 0;

					return Number(amountA) - Number(amountZ);
				}

				case "projectMonths": {
					const amountA = a[sortDescriptor.column] ?? 0;
					const amountZ = z[sortDescriptor.column] ?? 0;

					return amountA - amountZ;
				}

				case "startDate": {
					const dateA = a[sortDescriptor.column]?.getTime() ?? 0;
					const dateZ = z[sortDescriptor.column]?.getTime() ?? 0;

					return dateA - dateZ;
				}

				default: {
					const valueA = a[sortDescriptor.column] ?? "";
					const valueZ = z[sortDescriptor.column] ?? "";

					return valueA.localeCompare(valueZ);
				}
			}
		});

		if (sortDescriptor.direction === "descending") {
			items.reverse();
		}

		return items;
	}, [sortDescriptor, projectsFundingLeverages]);

	const pagination = usePagination({ items });

	return (
		<Fragment>
			<div className="flex justify-end">
				<Pagination pagination={pagination} />
			</div>

			<Table
				aria-label="Project fundings"
				className="w-full"
				// @ts-expect-error It's fine.
				onSortChange={setSortDescriptor}
				selectionMode="none"
				sortDescriptor={sortDescriptor}
			>
				<TableHeader>
					<Column allowsSorting={true} defaultWidth="2fr" id="name" isRowHeader={true}>
						Name
					</Column>
					<Column allowsSorting={true} id="amount">
						Amount
					</Column>
					<Column allowsSorting={true} id="funders">
						Funders
					</Column>
					<Column allowsSorting={true} id="projectMonths">
						Project Months
					</Column>
					<Column allowsSorting={true} id="scope">
						Scope
					</Column>
					<Column allowsSorting={true} id="startDate">
						Start date
					</Column>
					<Column allowsSorting={true} id="totalAmount">
						Total Amount
					</Column>
					<Column defaultWidth={50} id="actions">
						Actions
					</Column>
				</TableHeader>
				<TableBody items={pagination.currentItems}>
					{(row) => {
						function onAction(key: Key) {
							switch (key) {
								case "delete": {
									setAction({ kind: "delete", item: row });
									break;
								}

								case "edit": {
									setAction({ kind: "edit", item: row });
									break;
								}
							}
						}

						return (
							<Row>
								<Cell>
									<span title={row.name}>{row.name}</span>
								</Cell>
								<Cell>
									{row.amount != null
										? number(Number(row.amount), { style: "currency", currency: "EUR" })
										: undefined}
								</Cell>
								<Cell>{row.funders}</Cell>
								<Cell>{row.projectMonths}</Cell>
								<Cell>{row.scope}</Cell>
								<Cell>{row.startDate != null ? dateTime(row.startDate) : undefined}</Cell>
								<Cell>
									{row.totalAmount != null
										? number(Number(row.totalAmount), { style: "currency", currency: "EUR" })
										: undefined}
								</Cell>
								<Cell>
									<div className="flex justify-end">
										<DropdownMenuTrigger>
											<IconButton className="mx-auto" variant="plain">
												<MoreHorizontalIcon aria-hidden={true} className="size-5 shrink-0" />
												<span className="sr-only">Menu</span>
											</IconButton>
											<DropdownMenu onAction={onAction} placement="bottom">
												<DropdownMenuItem id="edit">
													Edit
													<PencilIcon aria-hidden={true} className="size-4 shrink-0" />
												</DropdownMenuItem>
												<DropdownMenuItem id="delete">
													Delete
													<Trash2Icon aria-hidden={true} className="size-4 shrink-0" />
												</DropdownMenuItem>
											</DropdownMenu>
										</DropdownMenuTrigger>
									</div>
								</Cell>
							</Row>
						);
					}}
				</TableBody>
			</Table>

			<div className="flex justify-end">
				<Pagination pagination={pagination} />
			</div>

			<EditProjectFundingLeverageDialog
				key={createKey("edit-project-funding-leverage", action?.item.id)}
				action={action}
				onClose={onDialogClose}
			/>
			<DeleteProjectFundingLeverageDialog
				key={createKey("delete-project-funding-leverage", action?.item.id)}
				action={action}
				onClose={onDialogClose}
			/>
		</Fragment>
	);
}

interface DeleteProjectFundingLeverageDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeleteProjectFundingLeverageDialog(props: DeleteProjectFundingLeverageDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(deleteProjectFundingLeverageAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete project funding</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete &quot;{action.item.name}&quot;?
									</DialogDescription>
								</DialogHeader>

								<div>
									<Form
										action={(formData) => {
											formAction(formData);
											close();
										}}
										className="grid gap-y-6"
										id={formId}
										validationErrors={
											formState?.status === "error" ? formState.fieldErrors : undefined
										}
									>
										<input name="id" type="hidden" value={action.item.id} />

										<FormSuccessMessage key={createKey("form-success", formState?.timestamp)}>
											{formState?.status === "success" && formState.message.length > 0
												? formState.message
												: null}
										</FormSuccessMessage>

										<FormErrorMessage key={createKey("form-error", formState?.timestamp)}>
											{formState?.status === "error" && formState.formErrors.length > 0
												? formState.formErrors
												: null}
										</FormErrorMessage>
									</Form>
								</div>

								<DialogFooter>
									<DialogCancelButton>Cancel</DialogCancelButton>
									<SubmitButton form={formId}>Delete</SubmitButton>
								</DialogFooter>
							</Fragment>
						);
					}}
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}

interface EditProjectFundingLeverageDialogProps {
	action: Action | null;
	onClose: () => void;
}

function EditProjectFundingLeverageDialog(props: EditProjectFundingLeverageDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(updateProjectFundingLeverageAction, undefined);

	if (action?.kind !== "edit") return null;

	const projectFundingLeverage = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update project funding leverage</DialogTitle>
									<DialogDescription>
										Please provide project funding leverage details.
									</DialogDescription>
								</DialogHeader>

								<div>
									<ProjectFundingLeverageEditForm
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										projectFundingLeverage={projectFundingLeverage}
									/>
								</div>

								<DialogFooter>
									<DialogCancelButton>Cancel</DialogCancelButton>
									<SubmitButton form={formId}>Update</SubmitButton>
								</DialogFooter>
							</Fragment>
						);
					}}
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}

interface ProjectFundingLeverageEditFormProps {
	projectFundingLeverage: Prisma.ProjectsFundingLeverageGetPayload<{
		include: {
			report: { select: { id: true } };
		};
	}> | null;
	formId: string;
	formAction: (formData: FormData) => void;
	formState: Awaited<ReturnType<typeof updateProjectFundingLeverageAction>> | undefined;
	onClose: () => void;
}

function ProjectFundingLeverageEditForm(props: ProjectFundingLeverageEditFormProps) {
	const { formId, formAction, formState, projectFundingLeverage, onClose } = props;

	const scopes = Object.values(ProjectScope);

	return (
		<Form
			action={(formData) => {
				formAction(formData);
				onClose();
			}}
			className="grid gap-y-6"
			id={formId}
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			{projectFundingLeverage != null ? (
				<input name="id" type="hidden" value={projectFundingLeverage.id} />
			) : null}

			<TextInputField
				defaultValue={projectFundingLeverage?.name}
				isRequired={true}
				label="Name"
				name="name"
			/>

			<NumberInputField
				defaultValue={Number(projectFundingLeverage?.amount)}
				formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
				// isRequired={true}
				label="Amount"
				name="amount"
			/>

			<TextInputField
				defaultValue={projectFundingLeverage?.funders ?? undefined}
				isRequired={true}
				label="Funder"
				name="funders"
			/>

			<NumberInputField
				defaultValue={projectFundingLeverage?.projectMonths ?? undefined}
				// isRequired={true}
				label="Project months"
				name="projectMonths"
			/>

			<SelectField
				defaultSelectedKey={projectFundingLeverage?.scope ?? undefined}
				isRequired={true}
				label="Scope"
				name="scope"
			>
				{scopes.map((scope) => {
					return (
						<SelectItem key={scope} id={scope} textValue={scope}>
							{scope}
						</SelectItem>
					);
				})}
			</SelectField>

			<DateInputField
				defaultValue={
					projectFundingLeverage?.startDate
						? toDateValue(projectFundingLeverage.startDate)
						: undefined
				}
				granularity="day"
				// isRequired={true}
				label="Start date"
				name="startDate"
			/>

			<NumberInputField
				defaultValue={Number(projectFundingLeverage?.totalAmount)}
				formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
				// isRequired={true}
				label="Total Amount"
				name="totalAmount"
			/>

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
