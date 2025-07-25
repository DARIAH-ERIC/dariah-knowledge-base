"use client";

import { keyByToMap } from "@acdh-oeaw/lib";
import type { Contribution, Person, Prisma } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon, TrashIcon } from "lucide-react";
import { useFormatter } from "next-intl";
import {
	Fragment,
	type ReactNode,
	useActionState,
	useCallback,
	useId,
	useMemo,
	useState,
} from "react";
import { Group, type Key } from "react-aria-components";

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
import { FormFieldArray, FormFieldArrayButton } from "@/components/ui/form-field-array";
import { FormSuccess as FormSuccessMessage } from "@/components/ui/form-success";
import { IconButton } from "@/components/ui/icon-button";
import { Modal, ModalOverlay } from "@/components/ui/modal";
import { Cell, Column, Row, Table, TableBody, TableHeader } from "@/components/ui/table";
import { createWorkingGroupAction } from "@/lib/actions/admin/create-working-group";
import { deleteWorkingGroupAction } from "@/lib/actions/admin/delete-working-group";
import { updateWorkingGroupAction } from "@/lib/actions/admin/update-working-group";
import { createKey } from "@/lib/create-key";
import { toDateValue } from "@/lib/to-date-value";

type Action =
	| {
			kind: "create";
			item: null;
	  }
	| {
			kind: "delete";
			item: Prisma.WorkingGroupGetPayload<{
				include: {
					chairs: { select: { id: true } };
				};
			}>;
	  }
	| {
			kind: "edit";
			item: Prisma.WorkingGroupGetPayload<{
				include: {
					chairs: { select: { id: true; personId: true; startDate: true; endDate: true } };
				};
			}>;
	  };

interface AdminWorkingGroupsTableContentProps {
	chairs: Array<Contribution>;
	persons: Array<Person>;
	workingGroups: Array<
		Prisma.WorkingGroupGetPayload<{
			include: {
				chairs: { select: { id: true; startDate: true; endDate: true; personId: true } };
			};
		}>
	>;
}

export function AdminWorkingGroupsTableContent(
	props: AdminWorkingGroupsTableContentProps,
): ReactNode {
	const { chairs, persons, workingGroups } = props;

	const { dateTime, dateTimeRange } = useFormatter();

	const chairsById = useMemo(() => {
		return keyByToMap(chairs, (chair) => {
			return chair.id;
		});
	}, [chairs]);

	const personsById = useMemo(() => {
		return keyByToMap(persons, (person) => {
			return person.id;
		});
	}, [persons]);

	const getPersonByChairId = useCallback(
		(chairId: string) => {
			const chairPersonId = chairsById.get(chairId)?.personId;
			if (!chairPersonId) return;
			const chairPerson = personsById.get(chairPersonId);
			return chairPerson;
		},
		[chairsById, personsById],
	);

	const getChairPeriod = useCallback(
		(chairId: string) => {
			const chair: Contribution | undefined = chairsById.get(chairId);
			let chairPeriod;
			if (chair) {
				const { startDate, endDate } = chair;
				if (startDate && endDate) {
					chairPeriod = dateTimeRange(startDate, endDate);
				} else if (startDate) {
					chairPeriod = `${dateTime(startDate)} –`;
				} else if (endDate) {
					chairPeriod = `– ${dateTime(endDate)}`;
				}
			}
			return chairPeriod;
		},
		[chairsById, dateTime, dateTimeRange],
	);

	const [action, setAction] = useState<Action | null>(null);

	function onDialogClose() {
		setAction(null);
	}

	const [sortDescriptor, setSortDescriptor] = useState({
		column: "name" as "chairs" | "endDate" | "name" | "startDate",
		direction: "ascending" as "ascending" | "descending",
	});

	const items = useMemo(() => {
		const items = workingGroups.toSorted((a, z) => {
			switch (sortDescriptor.column) {
				case "chairs": {
					const idA = a.chairs[0]?.id;
					const chairA = idA ? (getPersonByChairId(idA)?.name ?? "") : "";

					const idZ = z.chairs[0]?.id;
					const chairZ = idZ ? (getPersonByChairId(idZ)?.name ?? "") : "";

					return chairA.localeCompare(chairZ);
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
	}, [sortDescriptor, workingGroups, getPersonByChairId]);

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
				aria-label="Working Groups"
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
					<Column allowsSorting={true} defaultWidth="2fr" id="chairs">
						Chair
					</Column>
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
									{row.chairs
										.map((chair) => {
											const chairPersonName = getPersonByChairId(chair.id)?.name ?? "";
											const chairPeriod = getChairPeriod(chair.id);
											return chairPeriod ? `${chairPersonName} (${chairPeriod})` : chairPersonName;
										})
										.join(", ")}
								</Cell>
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

			<CreateWorkingGroupDialog
				key={createKey("create-working-group", action?.item?.id)}
				action={action}
				chairsById={chairsById}
				onClose={onDialogClose}
				persons={persons}
			/>
			<EditWorkingGroupDialog
				key={createKey("edit-working-group", action?.item?.id)}
				action={action}
				chairsById={chairsById}
				onClose={onDialogClose}
				persons={persons}
			/>
			<DeleteWorkingGroupDialog
				key={createKey("delete-working-group", action?.item?.id)}
				action={action}
				onClose={onDialogClose}
			/>
		</Fragment>
	);
}

interface DeleteWorkingGroupDialogProps {
	action: Action | null;
	onClose: () => void;
}

function DeleteWorkingGroupDialog(props: DeleteWorkingGroupDialogProps) {
	const { action, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(deleteWorkingGroupAction, undefined);

	if (action?.kind !== "delete") return null;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog role="alertdialog">
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Delete working group</DialogTitle>
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

interface CreateWorkingGroupDialogProps {
	action: Action | null;
	chairsById: Map<Contribution["id"], Contribution>;
	persons: Array<Person>;
	onClose: () => void;
}

function CreateWorkingGroupDialog(props: CreateWorkingGroupDialogProps) {
	const { action, chairsById, persons, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(createWorkingGroupAction, undefined);

	if (action?.kind !== "create") return null;

	const workingGroup = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create working group</DialogTitle>
									<DialogDescription>Please provide working group details.</DialogDescription>
								</DialogHeader>

								<div>
									<WorkingGroupEditForm
										chairsById={chairsById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										persons={persons}
										workingGroup={workingGroup}
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

interface EditWorkingGroupDialogProps {
	action: Action | null;
	chairsById: Map<Contribution["id"], Contribution>;
	persons: Array<Person>;
	onClose: () => void;
}

function EditWorkingGroupDialog(props: EditWorkingGroupDialogProps) {
	const { action, chairsById, persons, onClose } = props;

	const formId = useId();

	const [formState, formAction] = useActionState(updateWorkingGroupAction, undefined);

	if (action?.kind !== "edit") return null;

	const workingGroup = action.item;

	return (
		<ModalOverlay isOpen={true} onOpenChange={onClose}>
			<Modal isOpen={true} onOpenChange={onClose}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Update working group</DialogTitle>
									<DialogDescription>Please provide working group details.</DialogDescription>
								</DialogHeader>

								<div>
									<WorkingGroupEditForm
										chairsById={chairsById}
										formAction={formAction}
										formId={formId}
										formState={formState}
										onClose={close}
										persons={persons}
										workingGroup={workingGroup}
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

interface WorkingGroupEditFormProps {
	chairsById: Map<Contribution["id"], Contribution>;
	persons: Array<Person>;
	formId: string;
	formAction: (formData: FormData) => void;
	formState: Awaited<ReturnType<typeof updateWorkingGroupAction>> | undefined;
	workingGroup: Prisma.WorkingGroupGetPayload<{
		include: {
			chairs: { select: { id: true; personId: true; startDate: true; endDate: true } };
		};
	}> | null;
	onClose: () => void;
}

type WorkingGroupChair = {
	endDate: Date | null;
	startDate: Date | null;
	personId: string | null;
} & ({ id: string; _id?: undefined } | { _id: string; id?: undefined });

function WorkingGroupEditForm(props: WorkingGroupEditFormProps) {
	const { formId, formAction, formState, persons, workingGroup, onClose } = props;

	const chairs = useListData<WorkingGroupChair>({
		initialItems: workingGroup?.chairs ?? [],
		getKey(item) {
			return item._id ?? item.id;
		},
	});

	const chairsLabelId = useId();

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
			{workingGroup != null ? <input name="id" type="hidden" value={workingGroup.id} /> : null}

			<TextInputField
				defaultValue={workingGroup?.name}
				isRequired={true}
				label="Name"
				name="name"
			/>

			<FormFieldArray aria-labelledby={chairsLabelId} className="flex flex-col gap-y-4">
				<div
					className="text-sm leading-tight font-semibold tracking-tight text-neutral-950 dark:text-neutral-0"
					id={chairsLabelId}
				>
					Chairs
				</div>

				{chairs.items.length > 0 ? (
					<div className="flex flex-col gap-y-3">
						{chairs.items.map((chair, index) => {
							const { id, personId, endDate, startDate } = chair;

							const key = chair._id ?? chair.id;

							return (
								<Group key={key} className="flex w-full items-end gap-2">
									<input name={`chairs.${String(index)}.id`} type="hidden" value={id} />

									<SelectField
										className="w-64"
										defaultSelectedKey={personId ?? undefined}
										isRequired={true}
										label="Name"
										name={`chairs.${String(index)}.personId`}
									>
										{persons.map((person) => {
											return (
												<SelectItem key={person.name} id={person.id} textValue={person.name}>
													{person.name}
												</SelectItem>
											);
										})}
									</SelectField>

									<DateInputField
										className="w-32 shrink-0"
										defaultValue={startDate ? toDateValue(startDate) : undefined}
										granularity="day"
										label="Start date"
										name={`chairs.${String(index)}.startDate`}
									/>

									<DateInputField
										className="w-32 shrink-0"
										defaultValue={endDate ? toDateValue(endDate) : undefined}
										granularity="day"
										label="End date"
										name={`chairs.${String(index)}.endDate`}
									/>

									<IconButton
										className="mx-auto"
										onPress={() => {
											chairs.remove(key);
										}}
									>
										<TrashIcon aria-hidden={true} className="size-4.5 shrink-0" />
										<span className="sr-only">Remove</span>
									</IconButton>
								</Group>
							);
						})}
					</div>
				) : null}

				<FormFieldArrayButton
					className="mt-2 text-xs"
					onPress={() => {
						chairs.append({
							personId: null,
							startDate: null,
							endDate: null,
							_id: crypto.randomUUID(),
						});
					}}
				>
					<PlusIcon aria-hidden={true} className="size-3.5 shrink-0" />
					Add chair
				</FormFieldArrayButton>
			</FormFieldArray>

			<DateInputField
				defaultValue={workingGroup?.startDate ? toDateValue(workingGroup.startDate) : undefined}
				granularity="day"
				label="Start date"
				name="startDate"
			/>

			<DateInputField
				defaultValue={workingGroup?.endDate ? toDateValue(workingGroup.endDate) : undefined}
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
