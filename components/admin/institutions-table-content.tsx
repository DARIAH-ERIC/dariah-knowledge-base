"use client";

import { keyByToMap } from "@acdh-oeaw/lib";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { type Country, InstitutionType, type Prisma } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useFormatter } from "next-intl";
import { Fragment, type ReactNode, useId, useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { useFormState } from "react-dom";

import { Pagination } from "@/components/admin/pagination";
import { usePagination } from "@/components/admin/use-pagination";
import { SubmitButton } from "@/components/submit-button";
import { DateInputField } from "@/components/ui/blocks/date-input-field";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/blocks/dropdown-menu";
import { SelectField, SelectItem } from "@/components/ui/blocks/select-field";
import { TextInputField } from "@/components/ui/blocks/text-input-field";
import { Button } from "@/components/ui/button";
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
import {
	Cell,
	Column,
	Row,
	Table,
	TableBody,
	TableFilterSelect,
	TableHeader,
} from "@/components/ui/table";
import { createInstitutionAction } from "@/lib/actions/admin/create-institution";
import { deleteInstitutionAction } from "@/lib/actions/admin/delete-institution";
import { updateInstitutionAction } from "@/lib/actions/admin/update-institution";
import { createKey } from "@/lib/create-key";

const EMPTY_FILTER = "_all_";

type Action =
	| {
			kind: "create";
			item: null;
	  }
	| {
			kind: "delete";
			item: Prisma.InstitutionGetPayload<{
				include: {
					countries: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.InstitutionGetPayload<{
				include: {
					countries: { select: { id: true } };
				};
			}>;
	  };

interface AdminInstitutionsTableContentProps {
	countries: Array<Country>;
	institutions: Array<
		Prisma.InstitutionGetPayload<{
			include: {
				countries: { select: { id: true } };
			};
		}>
	>;
}

export function AdminInstitutionsTableContent(
	props: AdminInstitutionsTableContentProps,
): ReactNode {
	const { countries, institutions } = props;

	const { dateTime } = useFormatter();

	const countriesById = useMemo(() => {
		return keyByToMap(countries, (country) => {
			return country.id;
		});
	}, [countries]);

	const [action, setAction] = useState<Action | null>(null);

	function onDialogClose() {
		setAction(null);
	}

	const list = useListData({
		initialItems: institutions,
		filter: (item, countryId) => {
			if (!countryId || countryId === EMPTY_FILTER) {
				return true;
			}

			return item.countries.some((country) => {
				return country.id === countryId;
			});
		},
	});

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as "country" | "endDate" | "name" | "startDate" | "types",
		direction: "ascending" as "ascending" | "descending",
	});

	const items = useMemo(() => {
		const items = [...list.items].toSorted((a, z) => {
			switch (sortDescriptor.column) {
				case "country": {
					const idA = a.countries[0]?.id;
					const countryA = idA ? (countriesById.get(idA)?.name ?? "") : "";

					const idZ = z.countries[0]?.id;
					const countryZ = idZ ? (countriesById.get(idZ)?.name ?? "") : "";

					return countryA.localeCompare(countryZ);
				}

				case "types": {
					const typeA = a.types[0] ?? "";
					const typeZ = z.types[0] ?? "";

					return typeA.localeCompare(typeZ);
				}

				case "startDate":
				case "endDate": {
					const dateA = a[sortDescriptor.column]?.getDate() ?? 0;
					const dateZ = z[sortDescriptor.column]?.getDate() ?? 0;

					return dateA - dateZ;
				}

				default: {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					const valueA = a[sortDescriptor.column] ?? "";
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					const valueZ = z[sortDescriptor.column] ?? "";

					return valueA.localeCompare(valueZ);
				}
			}
		});

		if (sortDescriptor.direction === "descending") {
			items.reverse();
		}

		return items;
	}, [sortDescriptor, list.items, countriesById]);

	const pagination = usePagination({ items: items });

	const countryFilterOptions = useMemo(() => {
		return [
			{ id: EMPTY_FILTER, label: "Show all" },
			...Array.from(countriesById.values()).map((country) => {
				return { id: country.id, label: country.name };
			}),
		];
	}, [countriesById]);

	return (
		<Fragment>
			<div className="flex justify-end">
				<Button
					onPress={() => {
						setAction({ kind: "create", item: null });
					}}
				>
					<PlusIcon aria-hidden={true} className="size-5 shrink-0" />
					<span>Create</span>
				</Button>
			</div>

			<div className="flex justify-end">
				<Pagination pagination={pagination} />
			</div>
			<div className="flex justify-end">
				<TableFilterSelect
					defaultSelectedKey={EMPTY_FILTER}
					items={countryFilterOptions}
					label="Filter by Country"
					onSelectionChange={(key) => {
						list.setFilterText(String(key));
					}}
				/>
			</div>

			<Table
				aria-label="Services"
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
					<Column allowsSorting={true} id="country">
						Country
					</Column>
					<Column allowsSorting={true} id="types">
						Types
					</Column>
					<Column id="url">URL</Column>
					<Column id="ror">ROR</Column>
					<Column allowsSorting={true} id="startDate">
						Start date
					</Column>
					<Column allowsSorting={true} id="endDate">
						End date
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
									{row.countries[0]?.id ? countriesById.get(row.countries[0].id)?.name : undefined}
								</Cell>
								<Cell>{row.types}</Cell>
								<Cell>{row.url[0] ?? undefined}</Cell>
								<Cell>{row.ror}</Cell>
								<Cell>{row.startDate != null ? dateTime(row.startDate) : undefined}</Cell>
								<Cell>{row.endDate != null ? dateTime(row.endDate) : undefined}</Cell>
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

			<CreateInstitutionDialog
				key={createKey("create-institution", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				onClose={onDialogClose}
			/>
			<EditInstitutionDialog
				key={createKey("edit-institution", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				onClose={onDialogClose}
			/>
			<DeleteInstitutionDialog
				key={createKey("delete-institution", action?.item?.id)}
				action={action}
				onClose={onDialogClose}
			/>
		</Fragment>
	);
}

interface DeleteInstitutionDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeleteInstitutionDialog(props: DeleteInstitutionDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useFormState(deleteInstitutionAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete institution</DialogTitle>
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

interface CreateInstitutionDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	onClose: () => void;
}

function CreateInstitutionDialog(props: CreateInstitutionDialogProps) {
	const { action, countriesById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useFormState(createInstitutionAction, undefined);

	if (action?.kind !== "create") return null;

	const institution = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create institution</DialogTitle>
									<DialogDescription>Please provide institution details.</DialogDescription>
								</DialogHeader>

								<div>
									<InstitutionEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										institution={institution}
										onClose={close}
									/>
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

interface EditInstitutionDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	onClose: () => void;
}

function EditInstitutionDialog(props: EditInstitutionDialogProps) {
	const { action, countriesById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useFormState(updateInstitutionAction, undefined);

	if (action?.kind !== "edit") return null;

	const institution = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update institution</DialogTitle>
									<DialogDescription>Please provide institution details.</DialogDescription>
								</DialogHeader>

								<div>
									<InstitutionEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										institution={institution}
										onClose={close}
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

interface InstitutionEditFormProps {
	countriesById: Map<Country["id"], Country>;
	formId: string;
	formAction: (formData: FormData) => void;
	formState: Awaited<ReturnType<typeof createInstitutionAction>> | undefined;
	institution: Prisma.InstitutionGetPayload<{
		include: {
			countries: { select: { id: true } };
		};
	}> | null;
	onClose: () => void;
}

function InstitutionEditForm(props: InstitutionEditFormProps) {
	const { countriesById, formId, formAction, formState, institution, onClose } = props;

	const institutionTypes = Object.values(InstitutionType);

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
			{institution != null ? <input name="id" type="hidden" value={institution.id} /> : null}

			<TextInputField defaultValue={institution?.name} isRequired={true} label="Name" name="name" />

			{/* TODO: Multiple countries */}
			<SelectField
				defaultSelectedKey={institution?.countries[0]?.id}
				label="Country"
				name="countries.0"
			>
				{Array.from(countriesById.values()).map((country) => {
					return (
						<SelectItem key={country.id} id={country.id} textValue={country.name}>
							{country.name}
						</SelectItem>
					);
				})}
			</SelectField>

			{/* TODO: Multiple types */}
			<SelectField
				defaultSelectedKey={institution?.types[0]}
				label="Institution Type"
				name="types.0"
			>
				{institutionTypes.map((type) => {
					return (
						<SelectItem key={type} id={type} textValue={type}>
							{type}
						</SelectItem>
					);
				})}
			</SelectField>

			{/* TODO: Multiple URLs */}
			<TextInputField defaultValue={institution?.url[0] ?? undefined} label="URL" name="url.0" />

			<DateInputField
				defaultValue={
					institution?.startDate
						? parseAbsoluteToLocal(institution.startDate.toISOString())
						: undefined
				}
				granularity="day"
				label="Start date"
				name="startDate"
			/>

			<DateInputField
				defaultValue={
					institution?.endDate ? parseAbsoluteToLocal(institution.endDate.toISOString()) : undefined
				}
				granularity="day"
				label="End date"
				name="endDate"
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
