"use client";

import { keyByToMap } from "@acdh-oeaw/lib";
import type { Institution, Prisma } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Fragment, type ReactNode, useActionState, useId, useMemo, useState } from "react";
import type { Key } from "react-aria-components";

import { Pagination } from "@/components/admin/pagination";
import { usePagination } from "@/components/admin/use-pagination";
import { SubmitButton } from "@/components/submit-button";
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
import { Cell, Column, Row, Table, TableBody, TableHeader } from "@/components/ui/table";
import { createPersonAction } from "@/lib/actions/admin/create-person";
import { deletePersonAction } from "@/lib/actions/admin/delete-person";
import { updatePersonAction } from "@/lib/actions/admin/update-person";
import { createKey } from "@/lib/create-key";

type Action =
	| {
			kind: "create";
			item: null;
	  }
	| {
			kind: "delete";
			item: Prisma.PersonGetPayload<{
				include: {
					institutions: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.PersonGetPayload<{
				include: {
					institutions: { select: { id: true } };
				};
			}>;
	  };

interface AdminPersonsTableContentProps {
	institutions: Array<
		Prisma.InstitutionGetPayload<{
			include: {
				countries: { select: { id: true; name: true } };
			};
		}>
	>;
	persons: Array<
		Prisma.PersonGetPayload<{
			include: {
				institutions: { select: { id: true } };
			};
		}>
	>;
}

export function AdminPersonsTableContent(props: AdminPersonsTableContentProps): ReactNode {
	const { institutions, persons } = props;

	const institutionsById = useMemo(() => {
		return keyByToMap(institutions, (institution) => {
			return institution.id;
		});
	}, [institutions]);

	const [action, setAction] = useState<Action | null>(null);

	function onDialogClose() {
		setAction(null);
	}

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as "institution" | "name",
		direction: "ascending" as "ascending" | "descending",
	});

	const items = useMemo(() => {
		const items = persons.toSorted((a, z) => {
			switch (sortDescriptor.column) {
				case "institution": {
					const idA = a.institutions[0]?.id;
					const institutionA = idA ? (institutionsById.get(idA)?.name ?? "") : "";

					const idZ = z.institutions[0]?.id;
					const institutionZ = idZ ? (institutionsById.get(idZ)?.name ?? "") : "";

					return institutionA.localeCompare(institutionZ);
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
	}, [sortDescriptor, persons, institutionsById]);

	const pagination = usePagination({ items });

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
					<Column allowsSorting={true} id="institution">
						Institution
					</Column>
					<Column id="email">Email</Column>
					<Column id="orcid">ORCID</Column>
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
									{row.institutions[0]?.id
										? institutionsById.get(row.institutions[0].id)?.name
										: undefined}
								</Cell>
								<Cell>{row.email}</Cell>
								<Cell>{row.orcid}</Cell>
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

			<CreatePersonDialog
				key={createKey("create-person", action?.item?.id)}
				action={action}
				institutionsById={institutionsById}
				onClose={onDialogClose}
			/>
			<EditPersonDialog
				key={createKey("edit-person", action?.item?.id)}
				action={action}
				institutionsById={institutionsById}
				onClose={onDialogClose}
			/>
			<DeletePersonDialog
				key={createKey("delete-person", action?.item?.id)}
				action={action}
				onClose={onDialogClose}
			/>
		</Fragment>
	);
}

interface DeletePersonDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeletePersonDialog(props: DeletePersonDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(deletePersonAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete person</DialogTitle>
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

interface CreatePersonDialogProps {
	action: Action | null;
	institutionsById: Map<
		Institution["id"],
		Prisma.InstitutionGetPayload<{
			include: {
				countries: { select: { id: true; name: true } };
			};
		}>
	>;
	onClose: () => void;
}

function CreatePersonDialog(props: CreatePersonDialogProps) {
	const { action, institutionsById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(createPersonAction, undefined);

	if (action?.kind !== "create") return null;

	const person = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create person</DialogTitle>
									<DialogDescription>Please provide person details.</DialogDescription>
								</DialogHeader>

								<div>
									<PersonEditForm
										formAction={formAction}
										formId={formId}
										formState={formState}
										institutionsById={institutionsById}
										onClose={close}
										person={person}
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

interface EditPersonDialogProps {
	action: Action | null;
	institutionsById: Map<
		Institution["id"],
		Prisma.InstitutionGetPayload<{
			include: {
				countries: { select: { id: true; name: true } };
			};
		}>
	>;
	onClose: () => void;
}

function EditPersonDialog(props: EditPersonDialogProps) {
	const { action, institutionsById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(updatePersonAction, undefined);

	if (action?.kind !== "edit") return null;

	const person = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update person</DialogTitle>
									<DialogDescription>Please provide person details.</DialogDescription>
								</DialogHeader>

								<div>
									<PersonEditForm
										formAction={formAction}
										formId={formId}
										formState={formState}
										institutionsById={institutionsById}
										onClose={close}
										person={person}
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

interface PersonEditFormProps {
	institutionsById: Map<
		Institution["id"],
		Prisma.InstitutionGetPayload<{
			include: {
				countries: { select: { id: true; name: true } };
			};
		}>
	>;
	formId: string;
	formAction: (formData: FormData) => void;
	formState: Awaited<ReturnType<typeof createPersonAction>> | undefined;
	person: Prisma.PersonGetPayload<{
		include: {
			institutions: { select: { id: true } };
		};
	}> | null;
	onClose: () => void;
}

function PersonEditForm(props: PersonEditFormProps) {
	const { institutionsById, formId, formAction, formState, person, onClose } = props;

	const defaultSelectedInstitutionId = person?.institutions[0]?.id;
	const defaultSelectedCountryId = defaultSelectedInstitutionId
		? institutionsById.get(defaultSelectedInstitutionId)?.countries[0]?.id
		: undefined;

	const list = useListData({
		initialItems: Array.from(institutionsById.values()),
		filter(item, countryId) {
			return item.countries.some((country) => {
				return country.id === countryId;
			});
		},
		initialFilterText: defaultSelectedCountryId,
	});

	const institutionCountries = useMemo(() => {
		return Array.from(institutionsById.values()).flatMap((institution) => {
			return institution.countries;
		});
	}, [institutionsById]);

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
			{person != null ? <input name="id" type="hidden" value={person.id} /> : null}

			<TextInputField defaultValue={person?.name} isRequired={true} label="Name" name="name" />

			<SelectField
				defaultSelectedKey={defaultSelectedCountryId}
				label="Country of Institution"
				onSelectionChange={(key) => {
					list.setFilterText(String(key));
				}}
			>
				{institutionCountries.map((institutionCountry) => {
					return (
						<SelectItem
							key={institutionCountry.id}
							id={institutionCountry.id}
							textValue={institutionCountry.name}
						>
							{institutionCountry.name}
						</SelectItem>
					);
				})}
			</SelectField>

			{/* TODO: Multiple institutions */}
			<SelectField
				defaultSelectedKey={defaultSelectedInstitutionId}
				isDisabled={list.items.length === 0}
				label="Institution"
				name="institutions.0"
			>
				{list.items.map((institution) => {
					return (
						<SelectItem key={institution.id} id={institution.id} textValue={institution.name}>
							{institution.name}
						</SelectItem>
					);
				})}
			</SelectField>

			<TextInputField defaultValue={person?.email ?? undefined} label="Email" name="email" />

			<TextInputField defaultValue={person?.orcid ?? undefined} label="ORCID" name="orcid" />

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
