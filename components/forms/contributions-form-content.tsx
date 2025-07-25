"use client";

import { groupByToMap, keyByToMap } from "@acdh-oeaw/lib";
import type { Country, Person, Prisma, Report, Role, WorkingGroup } from "@prisma/client";
import { useListData } from "@react-stately/data";
import { PlusIcon } from "lucide-react";
import { Fragment, type ReactNode, useActionState, useId } from "react";

import { SubmitButton } from "@/components/submit-button";
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
import { updateContributionsAction } from "@/lib/actions/update-contributions";
import { createKey } from "@/lib/create-key";
import { getFormData } from "@/lib/get-form-data";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

interface ContributionsFormContentProps {
	comments: ReportCommentsSchema["contributions"];
	countryId: Country["id"];
	contributions: Array<
		Prisma.ContributionGetPayload<{
			include: {
				person: { select: { id: true; name: true } };
				role: { select: { id: true; name: true } };
				workingGroup: { select: { id: true; name: true } };
			};
		}>
	>;
	contributionsCount: Report["contributionsCount"];
	previousContributionsCount: Report["contributionsCount"] | undefined;
	persons: Array<Pick<Person, "id" | "name">>;
	reportId: Report["id"];
	roles: Array<Pick<Role, "id" | "name">>;
	workingGroups: Array<Pick<Role, "id" | "name">>;
	year: number;
}

export function ContributionsFormContent(props: ContributionsFormContentProps): ReactNode {
	const {
		comments,
		countryId,
		contributions,
		contributionsCount,
		persons,
		previousContributionsCount,
		reportId,
		roles,
		workingGroups,
		year,
	} = props;

	const [formState, formAction] = useActionState(updateContributionsAction, undefined);

	const contributionsByRoleId = groupByToMap(contributions, (contribution) => {
		return contribution.roleId;
	});

	const personsById = keyByToMap(persons, (person) => {
		return person.id;
	});

	const _rolesById = keyByToMap(roles, (role) => {
		return role.id;
	});

	const workingGroupsById = keyByToMap(workingGroups, (workingGroup) => {
		return workingGroup.id;
	});

	const rolesByName = keyByToMap(roles, (role) => {
		return role.name;
	});

	// FIXME: role names should be database enum.
	const relevantRoles = [
		"National Representative",
		"National Coordinator",
		"JRC member",
		"WG chair",
	] as const;

	return (
		<Form
			action={formAction}
			className="grid gap-y-6"
			validationErrors={formState?.status === "error" ? formState.fieldErrors : undefined}
		>
			<input name="countryId" type="hidden" value={countryId} />

			<input name="reportId" type="hidden" value={reportId} />

			<input name="year" type="hidden" value={year} />

			<NumberInputField
				defaultValue={contributionsCount ?? undefined}
				description={
					previousContributionsCount != null
						? `Previous year: ${String(previousContributionsCount)}.`
						: undefined
				}
				label="Total contributors to national node"
				name="contributionsCount"
			/>

			<section className="grid content-start items-start gap-x-4 gap-y-6 xs:grid-cols-2 md:grid-cols-4">
				{relevantRoles.map((roleName) => {
					const role = rolesByName.get(roleName);
					if (role == null) return null;
					const roleId = role.id;
					const contributions = contributionsByRoleId.get(roleId) ?? [];

					return (
						<article key={roleId} className="grid gap-1.5">
							<ContributionsByRole
								key={formState?.timestamp}
								contributions={contributions}
								persons={persons}
								personsById={personsById}
								role={role}
								workingGroups={workingGroups}
								workingGroupsById={workingGroupsById}
							/>
						</article>
					);
				})}
			</section>

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

interface AddedContribution {
	_id: string;
	personId: Person["id"];
	roleId?: Role["id"];
	workingGroupId?: WorkingGroup["id"];
}

interface ContributionsByRoleProps {
	contributions: Array<
		Prisma.ContributionGetPayload<{
			include: {
				person: { select: { id: true; name: true } };
				role: { select: { id: true; name: true } };
				workingGroup: { select: { id: true; name: true } };
			};
		}>
	>;
	persons: Array<Pick<Person, "id" | "name">>;
	personsById: Map<Person["id"], Pick<Person, "id" | "name">>;
	role: Pick<Role, "id" | "name">;
	workingGroups: Array<Pick<Role, "id" | "name">>;
	workingGroupsById: Map<WorkingGroup["id"], Pick<Role, "id" | "name">>;
}

function ContributionsByRole(props: ContributionsByRoleProps): ReactNode {
	const { contributions, persons, personsById, role, workingGroups, workingGroupsById } = props;

	const addedContributions = useListData<AddedContribution>({
		initialItems: [],
		getKey(item) {
			return item._id;
		},
	});

	return (
		<Fragment>
			<h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-0">{role.name}</h3>

			<ul className="grid gap-y-4" role="list">
				{contributions.map((contribution) => {
					const workingGroup = contribution.workingGroup?.name;

					return (
						<li key={contribution.id}>
							<TextInputField
								defaultValue={
									workingGroup != null
										? `${contribution.person.name} (${workingGroup})`
										: contribution.person.name
								}
								isReadOnly={true}
								label="Name"
							/>
							{/* <button onPress>TODO: remove === set endDate</button> */}
						</li>
					);
				})}
			</ul>

			<hr />

			<ul className="grid gap-y-4" role="list">
				{addedContributions.items.map((contribution, index) => {
					const { personId, workingGroupId } = contribution;
					const person = personsById.get(personId);
					const workingGroup =
						workingGroupId != null ? workingGroupsById.get(workingGroupId) : null;

					return (
						<li key={contribution._id}>
							<input
								name={`addedContributions.${String(index)}.personId`}
								type="hidden"
								value={personId}
							/>

							<input
								name={`addedContributions.${String(index)}.roleId`}
								type="hidden"
								value={role.id}
							/>

							{workingGroupId != null ? (
								<input
									name={`addedContributions.${String(index)}.workingGroupId`}
									type="hidden"
									value={workingGroupId}
								/>
							) : null}

							<TextInputField
								defaultValue={
									workingGroup != null
										? `${String(person?.name)} (${workingGroup.name})`
										: person?.name
								}
								isReadOnly={true}
								label="Name"
							/>
						</li>
					);
				})}
			</ul>

			<div className="my-2">
				<DialogTrigger>
					<Button>
						<PlusIcon aria-hidden={true} className="size-4 shrink-0" />
						Add
					</Button>

					<AddContributionFormDialog
						action={(formData, close) => {
							const contribution = getFormData(formData) as AddedContribution;

							addedContributions.append(contribution);

							close();
						}}
						persons={persons}
						role={role}
						workingGroups={workingGroups}
					/>
				</DialogTrigger>
			</div>
		</Fragment>
	);
}

interface AddContributionFormDialogProps {
	action: (formData: FormData, close: () => void) => void;
	persons: Array<Pick<Person, "id" | "name">>;
	role: Pick<Role, "id" | "name">;
	workingGroups: Array<Pick<Role, "id" | "name">>;
}

function AddContributionFormDialog(props: AddContributionFormDialogProps): ReactNode {
	const { action, persons, role, workingGroups } = props;

	const formId = useId();

	return (
		<ModalOverlay>
			<Modal isDismissable={true}>
				<Dialog>
					{({ close }) => {
						return (
							<Fragment>
								<DialogHeader>
									<DialogTitle>Create contribution</DialogTitle>
									<DialogDescription>Please provide contribution details.</DialogDescription>
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

										<input name="roleId" type="hidden" value={role.id} />

										<SelectField isRequired={true} label="Name" name="personId">
											{persons.map((person) => {
												return (
													<SelectItem key={person.name} id={person.id} textValue={person.name}>
														{person.name}
													</SelectItem>
												);
											})}
										</SelectField>

										{role.name === "WG chair" ? (
											<SelectField isRequired={true} label="Working Group" name="workingGroupId">
												{workingGroups.map((workingGroup) => {
													return (
														<SelectItem
															key={workingGroup.name}
															id={workingGroup.id}
															textValue={workingGroup.name}
														>
															{workingGroup.name}
														</SelectItem>
													);
												})}
											</SelectField>
										) : null}
									</Form>
								</div>

								<DialogFooter>
									<DialogCancelButton>Cancel</DialogCancelButton>
									<SubmitButton form={formId}>Add</SubmitButton>
								</DialogFooter>
							</Fragment>
						);
					}}
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
