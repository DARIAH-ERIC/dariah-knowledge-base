"use client";

import { groupByToMap, keyByToMap } from "@acdh-oeaw/lib";
import {
	type Country,
	type Prisma,
	SoftwareMarketplaceStatus,
	SoftwareStatus,
} from "@prisma/client";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Fragment, type ReactNode, useActionState, useId, useMemo, useState } from "react";
import type { Key } from "react-aria-components";

import { Pagination } from "@/components/admin/pagination";
import { EMPTY_FILTER, useFilteredItems } from "@/components/admin/use-filtered-items";
import { usePagination } from "@/components/admin/use-pagination";
import { SubmitButton } from "@/components/submit-button";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/blocks/dropdown-menu";
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
import { createSoftwareAction } from "@/lib/actions/admin/create-software";
import { deleteSoftwareAction } from "@/lib/actions/admin/delete-software";
import { updateSoftwareAction } from "@/lib/actions/admin/update-software";
import { createKey } from "@/lib/create-key";

type Action =
	| {
			kind: "create";
			item: null;
	  }
	| {
			kind: "delete";
			item: Prisma.SoftwareGetPayload<{
				include: {
					countries: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.SoftwareGetPayload<{
				include: {
					countries: { select: { id: true } };
				};
			}>;
	  };

interface AdminSoftwareTableContentProps {
	countries: Array<Country>;
	software: Array<
		Prisma.SoftwareGetPayload<{
			include: {
				countries: { select: { id: true } };
			};
		}>
	>;
}

export function AdminSoftwareTableContent(props: AdminSoftwareTableContentProps): ReactNode {
	const { countries, software } = props;

	const countriesById = useMemo(() => {
		return keyByToMap(countries, (country) => {
			return country.id;
		});
	}, [countries]);

	const [action, setAction] = useState<Action | null>(null);

	function onDialogClose() {
		setAction(null);
	}

	const [filteredItems, setCountryIdFilter] = useFilteredItems(software, (software, countryId) => {
		return software.countries.some((country) => {
			return country.id === countryId;
		});
	});

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as "country" | "marketplaceStatus" | "name" | "status",
		direction: "ascending" as "ascending" | "descending",
	});

	const items = useMemo(() => {
		const items = filteredItems.toSorted((a, z) => {
			switch (sortDescriptor.column) {
				case "country": {
					const idA = a.countries[0]?.id;
					const countryA = idA ? (countriesById.get(idA)?.name ?? "") : "";

					const idZ = z.countries[0]?.id;
					const countryZ = idZ ? (countriesById.get(idZ)?.name ?? "") : "";

					return countryA.localeCompare(countryZ);
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
				aria-label="Software"
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
					<Column allowsSorting={true} id="status">
						Status
					</Column>
					<Column id="url">URL</Column>
					<Column id="marketplaceId">Marketplace ID</Column>
					<Column allowsSorting={true} id="marketplaceStatus">
						Marketplace status
					</Column>
					<Column id="comment">Comment</Column>
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
								<Cell>{row.status}</Cell>
								<Cell>
									<span title={row.url[0] ?? undefined}>{row.url[0]}</span>
								</Cell>
								<Cell>{row.marketplaceId}</Cell>
								<Cell>{row.marketplaceStatus}</Cell>
								<Cell>
									<span title={row.comment ?? undefined}>{row.comment}</span>
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

			<CreateSoftwareDialog
				key={createKey("create-software", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				onClose={onDialogClose}
			/>
			<EditSoftwareDialog
				key={createKey("edit-software", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				onClose={onDialogClose}
			/>
			<DeleteSoftwareDialog
				key={createKey("delete-software", action?.item?.id)}
				action={action}
				onClose={onDialogClose}
			/>

			<SoftwareStatistics software={software} />
		</Fragment>
	);
}

interface DeleteSoftwareDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeleteSoftwareDialog(props: DeleteSoftwareDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(deleteSoftwareAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete software</DialogTitle>
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

interface CreateSoftwareDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	onClose: () => void;
}

function CreateSoftwareDialog(props: CreateSoftwareDialogProps) {
	const { action, countriesById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(createSoftwareAction, undefined);

	if (action?.kind !== "create") return null;

	const software = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create software</DialogTitle>
									<DialogDescription>Please provide software details.</DialogDescription>
								</DialogHeader>

								<div>
									<SoftwareEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										software={software}
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

interface EditSoftwareDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	onClose: () => void;
}

function EditSoftwareDialog(props: EditSoftwareDialogProps) {
	const { action, countriesById, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(updateSoftwareAction, undefined);

	if (action?.kind !== "edit") return null;

	const software = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update software</DialogTitle>
									<DialogDescription>Please provide software details.</DialogDescription>
								</DialogHeader>

								<div>
									<SoftwareEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										software={software}
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

interface SoftwareEditFormProps {
	countriesById: Map<Country["id"], Country>;
	formId: string;
	formAction: (formData: FormData) => void;
	formState:
		| Awaited<ReturnType<typeof createSoftwareAction | typeof updateSoftwareAction>>
		| undefined;
	software: Prisma.SoftwareGetPayload<{
		include: {
			countries: { select: { id: true } };
		};
	}> | null;
	onClose: () => void;
}

function SoftwareEditForm(props: SoftwareEditFormProps) {
	const { countriesById, formId, formAction, formState, software, onClose } = props;

	const softwareStatuses = Object.values(SoftwareStatus);
	const softwareMarketplaceStatuses = Object.values(SoftwareMarketplaceStatus);

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
			{software != null ? <input name="id" type="hidden" value={software.id} /> : null}

			<TextInputField defaultValue={software?.name} isRequired={true} label="Name" name="name" />

			{/* TODO: Multiple countries */}
			<SelectField
				defaultSelectedKey={software?.countries[0]?.id}
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

			<SelectField defaultSelectedKey={software?.status ?? undefined} label="Status" name="status">
				{softwareStatuses.map((softwareStatus) => {
					return (
						<SelectItem key={softwareStatus} id={softwareStatus} textValue={softwareStatus}>
							{softwareStatus}
						</SelectItem>
					);
				})}
			</SelectField>

			{/* TODO: Multiple URLs */}
			<TextInputField defaultValue={software?.url[0] ?? undefined} label="URL" name="url.0" />

			<TextInputField
				defaultValue={software?.marketplaceId ?? undefined}
				label="Marketplace ID"
				name="marketplaceId"
			/>

			<SelectField
				defaultSelectedKey={software?.marketplaceStatus ?? undefined}
				label="Marketplace status"
				name="marketplaceStatus"
			>
				{softwareMarketplaceStatuses.map((softwareMarketplaceStatus) => {
					return (
						<SelectItem
							key={softwareMarketplaceStatus}
							id={softwareMarketplaceStatus}
							textValue={softwareMarketplaceStatus}
						>
							{softwareMarketplaceStatus}
						</SelectItem>
					);
				})}
			</SelectField>

			<TextAreaField defaultValue={software?.comment ?? undefined} label="Comment" name="comment" />

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

interface SoftwareStatisticsProps {
	software: Array<
		Prisma.SoftwareGetPayload<{
			include: {
				countries: { select: { id: true } };
			};
		}>
	>;
}

function SoftwareStatistics(props: SoftwareStatisticsProps) {
	const { software } = props;

	const softwareByStatus = useMemo(() => {
		return groupByToMap(software, (item) => {
			return item.status;
		});
	}, [software]);

	return (
		<div className="grid gap-y-2 text-sm text-neutral-700 dark:text-neutral-300">
			<p>There are currently {software.length} software entries in the database.</p>
			<dl className="grid gap-y-2">
				<div>
					<dt className="text-xs font-semibold tracking-wide uppercase">Grouped by status</dt>
					<dd>
						<ul>
							{Object.values(SoftwareStatus).map((status) => {
								return (
									<li key={status}>
										<span>
											{status}: {softwareByStatus.get(status)?.length ?? 0}
										</span>
									</li>
								);
							})}
						</ul>
					</dd>
				</div>
			</dl>
		</div>
	);
}
