"use client";

import { groupByToMap, keyByToMap } from "@acdh-oeaw/lib";
import {
	type Country,
	type Institution,
	InstitutionServiceRole,
	type Prisma,
	ServiceAudience,
	ServiceMarketplaceStatus,
	type ServiceSize,
	ServiceStatus,
	ServiceType,
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
import { NumberInputField } from "@/components/ui/blocks/number-input-field";
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
import { FormFieldsGroup } from "@/components/ui/form-fields-group";
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
import { createServiceAction } from "@/lib/actions/admin/create-service";
import { deleteServiceAction } from "@/lib/actions/admin/delete-service";
import { updateServiceAction } from "@/lib/actions/admin/update-service";
import { createKey } from "@/lib/create-key";

type Action =
	| {
			kind: "create";
			item: null;
	  }
	| {
			kind: "delete";
			item: Prisma.ServiceGetPayload<{
				include: {
					countries: { select: { id: true } };
					institutions: { select: { role: true; institution: { select: { id: true } } } };
					size: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.ServiceGetPayload<{
				include: {
					countries: { select: { id: true } };
					institutions: { select: { role: true; institution: { select: { id: true } } } };
					size: { select: { id: true } };
				};
			}>;
	  };

interface AdminServicesTableContentProps {
	countries: Array<Country>;
	services: Array<
		Prisma.ServiceGetPayload<{
			include: {
				countries: { select: { id: true } };
				institutions: { select: { role: true; institution: { select: { id: true } } } };
				size: { select: { id: true } };
			};
		}>
	>;
	serviceSizes: Array<
		Prisma.ServiceSizeGetPayload<{
			select: {
				id: true;
				annualValue: true;
				type: true;
			};
		}>
	>;
	institutions: Array<Institution>;
}

export function AdminServicesTableContent(props: AdminServicesTableContentProps): ReactNode {
	const { countries, institutions, services, serviceSizes } = props;

	const countriesById = useMemo(() => {
		return keyByToMap(countries, (country) => {
			return country.id;
		});
	}, [countries]);

	const institutionsById = useMemo(() => {
		return keyByToMap(institutions, (institution) => {
			return institution.id;
		});
	}, [institutions]);

	const serviceSizesById = useMemo(() => {
		return keyByToMap(serviceSizes, (serviceSize) => {
			return serviceSize.id;
		});
	}, [serviceSizes]);

	const [action, setAction] = useState<Action | null>(null);

	function onDialogClose() {
		setAction(null);
	}

	const [filteredItems, setCountryIdFilter] = useFilteredItems(services, (service, countryId) => {
		return service.countries.some((country) => {
			return country.id === countryId;
		});
	});

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as "country" | "marketplaceStatus" | "name" | "size" | "status" | "type",
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

				case "size": {
					const idA = a.size.id;
					const sizeA = serviceSizesById.get(idA)?.type ?? "";

					const idZ = z.size.id;
					const sizeZ = serviceSizesById.get(idZ)?.type ?? "";

					return sizeA.localeCompare(sizeZ);
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
	}, [sortDescriptor, filteredItems, countriesById, serviceSizesById]);

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
					<Column allowsSorting={true} id="status">
						Status
					</Column>
					<Column allowsSorting={true} id="size">
						Size
					</Column>
					<Column allowsSorting={true} id="type">
						Type
					</Column>
					<Column id="url">URL</Column>
					<Column id="marketplaceId">Marketplace ID</Column>
					<Column allowsSorting={true} id="marketplaceStatus">
						Marketplace status
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
								<Cell>{row.status}</Cell>
								<Cell>{serviceSizesById.get(row.size.id)?.type}</Cell>
								<Cell>{row.type}</Cell>
								<Cell>
									<span title={row.url[0] ?? undefined}>{row.url[0]}</span>
								</Cell>
								<Cell>{row.marketplaceId}</Cell>
								<Cell>{row.marketplaceStatus}</Cell>
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

			<CreateServicesDialog
				key={createKey("create-service", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				institutionsById={institutionsById}
				onClose={onDialogClose}
				serviceSizesById={serviceSizesById}
			/>
			<EditServicesDialog
				key={createKey("edit-service", action?.item?.id)}
				action={action}
				countriesById={countriesById}
				institutionsById={institutionsById}
				onClose={onDialogClose}
				serviceSizesById={serviceSizesById}
			/>
			<DeleteServicesDialog
				key={createKey("delete-service", action?.item?.id)}
				action={action}
				onClose={onDialogClose}
			/>

			<ServiceStatistics serviceSizesById={serviceSizesById} services={services} />
		</Fragment>
	);
}

interface DeleteServicesDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeleteServicesDialog(props: DeleteServicesDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(deleteServiceAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete service</DialogTitle>
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

interface CreateServicesDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	institutionsById: Map<Institution["id"], Institution>;
	serviceSizesById: Map<ServiceSize["id"], Pick<ServiceSize, "id" | "type">>;
	onClose: () => void;
}

function CreateServicesDialog(props: CreateServicesDialogProps) {
	const { action, countriesById, institutionsById, onClose, serviceSizesById } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(createServiceAction, undefined);

	if (action?.kind !== "create") return null;

	const service = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create service</DialogTitle>
									<DialogDescription>Please provide service details.</DialogDescription>
								</DialogHeader>

								<div>
									<ServicesEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										institutionsById={institutionsById}
										onClose={close}
										service={service}
										serviceSizesById={serviceSizesById}
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

interface EditServicesDialogProps {
	action: Action | null;
	countriesById: Map<Country["id"], Country>;
	institutionsById: Map<Institution["id"], Institution>;
	serviceSizesById: Map<ServiceSize["id"], Pick<ServiceSize, "id" | "type">>;
	onClose: () => void;
}

function EditServicesDialog(props: EditServicesDialogProps) {
	const { action, countriesById, institutionsById, onClose, serviceSizesById } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(updateServiceAction, undefined);

	if (action?.kind !== "edit") return null;

	const service = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update service</DialogTitle>
									<DialogDescription>Please provide service details.</DialogDescription>
								</DialogHeader>

								<div>
									<ServicesEditForm
										countriesById={countriesById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										institutionsById={institutionsById}
										onClose={close}
										service={service}
										serviceSizesById={serviceSizesById}
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

interface ServicesEditFormProps {
	countriesById: Map<Country["id"], Country>;
	formId: string;
	formAction: (formData: FormData) => void;
	formState: Awaited<ReturnType<typeof createServiceAction>> | undefined;
	service: Prisma.ServiceGetPayload<{
		include: {
			countries: { select: { id: true } };
			institutions: { select: { role: true; institution: { select: { id: true } } } };
			size: { select: { id: true } };
		};
	}> | null;
	institutionsById: Map<Institution["id"], Institution>;
	serviceSizesById: Map<ServiceSize["id"], Pick<ServiceSize, "id" | "type">>;
	onClose: () => void;
}

function ServicesEditForm(props: ServicesEditFormProps) {
	const {
		countriesById,
		formId,
		formAction,
		formState,
		institutionsById,
		service,
		serviceSizesById,
		onClose,
	} = props;

	const serviceStatuses = Object.values(ServiceStatus);
	const serviceMarketplaceStatuses = Object.values(ServiceMarketplaceStatus);
	const serviceTypes = Object.values(ServiceType);
	const serviceAudiences = Object.values(ServiceAudience);
	const institutionServiceRoles = Object.values(InstitutionServiceRole);

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
			{service != null ? <input name="id" type="hidden" value={service.id} /> : null}

			<TextInputField defaultValue={service?.name} isRequired={true} label="Name" name="name" />

			{/* TODO: Multiple countries */}
			<SelectField
				defaultSelectedKey={service?.countries[0]?.id}
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

			{/* TODO: Multiple institutions and roles */}
			<FormFieldsGroup>
				<SelectField
					defaultSelectedKey={service?.institutions[0]?.institution.id}
					label="Institution"
					name="institutions.0.institution"
				>
					{Array.from(institutionsById.values()).map((institution) => {
						return (
							<SelectItem key={institution.id} id={institution.id} textValue={institution.name}>
								{institution.name}
							</SelectItem>
						);
					})}
				</SelectField>

				<SelectField
					defaultSelectedKey={service?.institutions[0]?.role}
					label="Institution role"
					name="institutions.0.role"
				>
					{institutionServiceRoles.map((institutionServiceRole) => {
						return (
							<SelectItem
								key={institutionServiceRole}
								id={institutionServiceRole}
								textValue={institutionServiceRole}
							>
								{institutionServiceRole}
							</SelectItem>
						);
					})}
				</SelectField>
			</FormFieldsGroup>

			<SelectField defaultSelectedKey={service?.status ?? undefined} label="Status" name="status">
				{serviceStatuses.map((serviceStatus) => {
					return (
						<SelectItem key={serviceStatus} id={serviceStatus} textValue={serviceStatus}>
							{serviceStatus}
						</SelectItem>
					);
				})}
			</SelectField>

			<SelectField
				defaultSelectedKey={service?.size.id ?? undefined}
				isRequired={true}
				label="Size"
				name="size"
			>
				{Array.from(serviceSizesById.values()).map((serviceSize) => {
					return (
						<SelectItem key={serviceSize.id} id={serviceSize.id} textValue={serviceSize.type}>
							{serviceSize.type}
						</SelectItem>
					);
				})}
			</SelectField>

			<SelectField defaultSelectedKey={service?.type ?? undefined} label="Type" name="type">
				{serviceTypes.map((serviceType) => {
					return (
						<SelectItem key={serviceType} id={serviceType} textValue={serviceType}>
							{serviceType}
						</SelectItem>
					);
				})}
			</SelectField>

			{/* TODO: Multiple URLs */}
			<TextInputField defaultValue={service?.url[0] ?? undefined} label="URL" name="url.0" />

			<TextInputField
				defaultValue={service?.marketplaceId ?? undefined}
				label="Marketplace ID"
				name="marketplaceId"
			/>

			<SelectField
				defaultSelectedKey={service?.marketplaceStatus ?? undefined}
				label="Marketplace status"
				name="marketplaceStatus"
			>
				{serviceMarketplaceStatuses.map((serviceMarketplaceStatus) => {
					return (
						<SelectItem
							key={serviceMarketplaceStatus}
							id={serviceMarketplaceStatus}
							textValue={serviceMarketplaceStatus}
						>
							{serviceMarketplaceStatus}
						</SelectItem>
					);
				})}
			</SelectField>

			<TextInputField
				defaultValue={service?.agreements ?? undefined}
				label="Agreements"
				name="agreements"
			/>

			<TextInputField
				defaultValue={service?.valueProposition ?? undefined}
				label="Value proposition"
				name="valueProposition"
			/>

			<TextInputField
				defaultValue={service?.technicalContact ?? undefined}
				label="Technical contact"
				name="technicalContact"
			/>

			<NumberInputField
				defaultValue={service?.technicalReadinessLevel ?? undefined}
				label="Technical readiness level"
				name="technicalReadinessLevel"
			/>

			<SelectField
				defaultSelectedKey={service?.audience ?? undefined}
				label="Audience"
				name="audience"
			>
				{serviceAudiences.map((audience) => {
					return (
						<SelectItem key={audience} id={audience} textValue={audience}>
							{audience}
						</SelectItem>
					);
				})}
			</SelectField>

			<label className="flex items-center gap-x-2">
				<input
					defaultChecked={service?.dariahBranding ?? undefined}
					name="dariahBranding"
					type="checkbox"
				/>
				<span className="text-sm leading-normal font-medium text-neutral-950 transition select-none disabled:opacity-50 dark:text-neutral-0">
					DARIAH branding
				</span>
			</label>

			<label className="flex items-center gap-x-2">
				<input
					defaultChecked={service?.eoscOnboarding ?? undefined}
					name="eoscOnboarding"
					type="checkbox"
				/>
				<span className="text-sm leading-normal font-medium text-neutral-950 transition select-none disabled:opacity-50 dark:text-neutral-0">
					EOSC onboarding
				</span>
			</label>

			<label className="flex items-center gap-x-2">
				<input
					defaultChecked={service?.monitoring ?? undefined}
					name="monitoring"
					type="checkbox"
				/>
				<span className="text-sm leading-normal font-medium text-neutral-950 transition select-none disabled:opacity-50 dark:text-neutral-0">
					Monitoring
				</span>
			</label>

			<label className="flex items-center gap-x-2">
				<input
					defaultChecked={service?.privateSupplier ?? undefined}
					name="privateSupplier"
					type="checkbox"
				/>
				<span className="text-sm leading-normal font-medium text-neutral-950 transition select-none disabled:opacity-50 dark:text-neutral-0">
					Private supplier
				</span>
			</label>

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

interface ServiceStatisticsProps {
	services: Array<
		Prisma.ServiceGetPayload<{
			include: {
				countries: { select: { id: true } };
				institutions: { select: { role: true; institution: { select: { id: true } } } };
				size: { select: { id: true } };
			};
		}>
	>;
	serviceSizesById: Map<ServiceSize["id"], Pick<ServiceSize, "id" | "type">>;
}

function ServiceStatistics(props: ServiceStatisticsProps) {
	const { services, serviceSizesById } = props;

	const servicesBySize = useMemo(() => {
		return groupByToMap(services, (service) => {
			return service.size.id;
		});
	}, [services]);

	const servicesByStatus = useMemo(() => {
		return groupByToMap(services, (service) => {
			return service.status;
		});
	}, [services]);

	const servicesByType = useMemo(() => {
		return groupByToMap(services, (service) => {
			return service.type;
		});
	}, [services]);

	return (
		<div className="grid gap-y-2 text-sm text-neutral-700 dark:text-neutral-300">
			<p>There are currently {services.length} services in the database.</p>
			<dl className="grid gap-y-2">
				<div>
					<dt className="text-xs font-semibold tracking-wide uppercase">Grouped by size</dt>
					<dd>
						<ul>
							{Array.from(serviceSizesById.values()).map((size) => {
								return (
									<li key={size.id}>
										<span>
											{size.type}: {servicesBySize.get(size.id)?.length ?? 0}
										</span>
									</li>
								);
							})}
						</ul>
					</dd>
				</div>
				<div>
					<dt className="text-xs font-semibold tracking-wide uppercase">Grouped by status</dt>
					<dd>
						<ul>
							{Object.values(ServiceStatus).map((status) => {
								return (
									<li key={status}>
										<span>
											{status}: {servicesByStatus.get(status)?.length ?? 0}
										</span>
									</li>
								);
							})}
						</ul>
					</dd>
				</div>
				<div>
					<dt className="text-xs font-semibold tracking-wide uppercase">Grouped by type</dt>
					<dd>
						<ul>
							{Object.values(ServiceType).map((type) => {
								return (
									<li key={type}>
										<span>
											{type}: {servicesByType.get(type)?.length ?? 0}
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
