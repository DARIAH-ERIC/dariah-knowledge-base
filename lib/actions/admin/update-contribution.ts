"use server";

import { assert, log } from "@acdh-oeaw/lib";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { updateContribution } from "@/lib/data/contributions";
import { getRoleByTypes } from "@/lib/data/role";
import { getFormData } from "@/lib/get-form-data";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

const formSchema = z.object({
	id: z.string(),
	personId: z.string(),
	roleId: z.string(),
	workingGroupId: z.string().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	countryId: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface FormReturnValue {
	timestamp: number;
}

interface FormErrors extends FormReturnValue, z.typeToFlattenedError<FormSchema> {
	status: "error";
}

interface FormSuccess extends FormReturnValue {
	status: "success";
	message: string;
}

type FormState = FormErrors | FormSuccess;

export async function updateContributionAction(
	previousFormState: FormState | undefined,
	formData: FormData,
): Promise<FormState> {
	const t = await getTranslations("actions.admin.updateContribtion");

	await assertAuthenticated(["admin"]);

	const input = getFormData(formData);
	const result = formSchema.safeParse(input);

	if (!result.success) {
		log.error(result.error.flatten());

		return {
			status: "error" as const,
			...result.error.flatten(),
			timestamp: Date.now(),
		};
	}

	const { id, endDate, startDate, personId, countryId, roleId, workingGroupId } = result.data;

	try {
		const workingGroupRoles = await getRoleByTypes(["wg_chair", "wg_member"]);
		assert(workingGroupRoles.length > 0, 'Missing role "wg_chair" or "wg_member".');
		const workingGroupRoleIds = workingGroupRoles.map((role) => {
			return role.id;
		});

		if (workingGroupRoleIds.includes(roleId)) {
			assert(
				workingGroupId != null,
				'Working group must be provided when role is "wg_chair" or "wg_member".',
			);
		} else {
			assert(
				workingGroupId == null,
				'Working group must be empty when role is not "wg_chair" or "wg_member".',
			);
		}

		await updateContribution({
			id,
			personId,
			roleId,
			workingGroupId,
			countryId,
			endDate,
			startDate,
		});

		revalidatePath("/[locale]/dashboard/admin/contributions", "page");

		return {
			status: "success" as const,
			message: t("success"),
			timestamp: Date.now(),
		};
	} catch (error) {
		log.error(error);

		return {
			status: "error" as const,
			formErrors: [t("errors.default")],
			fieldErrors: {},
			timestamp: Date.now(),
		};
	}
}
