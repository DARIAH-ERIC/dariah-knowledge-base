"use client";

import { keyByToMap } from "@acdh-oeaw/lib";
import { type Country, OutreachType, type Prisma } from "@prisma/client";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useFormatter } from "next-intl";
import { Fragment, type ReactNode, useActionState, useId, useMemo, useState } from "react";
import type { Key } from "react-aria-components";

import { Pagination } from "@/components/admin/pagination";
import { EMPTY_FILTER, useFilteredItems } from "@/components/admin/use-filtered-items";
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
import { createOutreachAction } from "@/lib/actions/admin/create-outreach";
import { deleteOutreachAction } from "@/lib/actions/admin/delete-outreach";
import { updateOutreachAction } from "@/lib/actions/admin/update-outreach";
import { createKey } from "@/lib/create-key";
import { toDateValue } from "@/lib/to-date-value";

type Action =
	| {
			kind: "create";
			item: null;
	  }
	| {
			kind: "delete";
			item: Prisma.OutreachGetPayload<{
				include: {
					country: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.OutreachGetPayload<{
				include: {
					country: { select: { id: true } };
				};
			}>;
	  };

interface AdminOutreachTableContentProps {
	countries: Array<Country>;
	outreach: Array<
		Prisma.OutreachGetPayload<{
			include: {
				country: { select: { id: true } };
			};
		}>
	>;
}

export function AdminOutreachTableContent(props: AdminOutreachTableContentProps): ReactNode {
	const { countries, outreach } = props;

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

	const [filteredItems, setCountryIdFilter] = useFilteredItems(outreach, (outreach, countryId) => {
		return outreach.countryId === countryId;
	});

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as "country" | "endDate" | "name" | "startDate" | "type",
		direction: "ascending" as "ascending" | "descending",
	});

	const items = useMemo(() => {
		const items = filteredItems.toSorted((a, z) => {
			switch (sortDescriptor.column) {
				case "country": {
					const idA = a.country?.id;
					const countryA = idA ? (countriesById.get(idA)?.name ?? "") : "";

					const idZ = z.country?.id;
					const countryZ = idZ ? (countriesById.get(idZ)?.name ?? "") : "";

					return countryA.localeCompare(countryZ);
				}

				case "type": {
					const typeA = a.type;
					const typeZ = z.type;

					return typeA.localeCompare(typeZ);
				}

				case "startDate":
				case "endDate": {
					const dateA = a[sortDescriptor.column]?.getTime() ?? 0;
					const dateZ = z[sortDescriptor.column]?.getTime() ?? 0;

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
	}, [sortDescriptor, filteredItems, countriesById]);

	const pagination = usePagination({ items });

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
						setCountryIdFilter(String(key));
					}}
				/>
			</div>

			<Table
				aria-label="Outreach"
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
					<Column allowsSorting={true} id="startDate">
						Start date
					</Column>
					<Column allowsSorting={true} id="endDate">
						End date
					</Column>
					<Column allowsSorting={true} id="type">
						Type
					</Column>
					<Column id="url">URL</Column>
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
								<Cell>{row.country?.id ? countriesById.get(row.country.id)?.name : undefined}</Cell>
								<Cell>{row.startDate != null ? dateTime(row.startDate) : undefined}</Cell>
								<Cell>{row.endDate != null ? dateTime(row.endDate) : undefined}</Cell>
								<Cell>{row.type}</Cell>
								<Cell>
									<span title={row.url}>{row.url}</span>
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

			<CreateOutreachDialog
				key={createKey("create-outreach", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				onClose={onDialogClose}
			/>
			<EditOutreachDialog
				key={createKey("edit-outreach", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				onClose={onDialogClose}
			/>
			<DeleteOutreachDialog
				key={createKey("delete-outreach", action?.item?.id)}
				action={action}
				onClose={onDialogClose}
			/>
		</Fragment>
	);
}

interface DeleteOutreachDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeleteOutreachDialog(props: DeleteOutreachDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(deleteOutreachAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete outreach</DialogTitle>
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

interface CreateOutreachDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	onClose: () => void;
}

function CreateOutreachDialog(props: CreateOutreachDialogProps) {
	const { action, countriesById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(createOutreachAction, undefined);

	if (action?.kind !== "create") return null;

	const outreach = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create outreach</DialogTitle>
									<DialogDescription>Please provide outreach details.</DialogDescription>
								</DialogHeader>

								<div>
									<OutreachEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										outreach={outreach}
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

interface EditOutreachDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	onClose: () => void;
}

function EditOutreachDialog(props: EditOutreachDialogProps) {
	const { action, countriesById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(updateOutreachAction, undefined);

	if (action?.kind !== "edit") return null;

	const outreach = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update outreach</DialogTitle>
									<DialogDescription>Please provide outreach details.</DialogDescription>
								</DialogHeader>

								<div>
									<OutreachEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										outreach={outreach}
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

interface OutreachEditFormProps {
	countriesById: Map<Country["id"], Country>;
	formId: string;
	formAction: (formData: FormData) => void;
	formState: Awaited<ReturnType<typeof createOutreachAction>> | undefined;
	outreach: Prisma.OutreachGetPayload<{
		include: {
			country: { select: { id: true } };
		};
	}> | null;
	onClose: () => void;
}

function OutreachEditForm(props: OutreachEditFormProps) {
	const { countriesById, formId, formAction, formState, outreach, onClose } = props;

	const outreachTypes = Object.values(OutreachType);

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
			{outreach != null ? <input name="id" type="hidden" value={outreach.id} /> : null}

			<TextInputField defaultValue={outreach?.name} isRequired={true} label="Name" name="name" />

			<SelectField defaultSelectedKey={outreach?.country?.id} label="Country" name="country">
				{Array.from(countriesById.values()).map((country) => {
					return (
						<SelectItem key={country.id} id={country.id} textValue={country.name}>
							{country.name}
						</SelectItem>
					);
				})}
			</SelectField>

			<SelectField defaultSelectedKey={outreach?.type} isRequired={true} label="Type" name="type">
				{outreachTypes.map((type) => {
					return (
						<SelectItem key={type} id={type} textValue={type}>
							{type}
						</SelectItem>
					);
				})}
			</SelectField>

			<TextInputField defaultValue={outreach?.url} isRequired={true} label="URL" name="url" />

			<DateInputField
				defaultValue={outreach?.startDate ? toDateValue(outreach.startDate) : undefined}
				granularity="day"
				label="Start date"
				name="startDate"
			/>

			<DateInputField
				defaultValue={outreach?.endDate ? toDateValue(outreach.endDate) : undefined}
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
