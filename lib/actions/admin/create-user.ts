"use server";

import { log } from "@acdh-oeaw/lib";
import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { createFullUser as createUser } from "@/lib/data/user";
import { getFormData } from "@/lib/get-form-data";

const formSchema = z.object({
	name: z.string().optional(),
	role: z.enum(Object.values(UserRole) as [UserRole, ...Array<UserRole>]),
	status: z.enum(Object.values(UserStatus) as [UserStatus, ...Array<UserStatus>]),
	country: z.string().optional(),
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

export async function createUserAction(
	previousFormState: FormState | undefined,
	formData: FormData,
): Promise<FormState> {
	const t = await getTranslations("actions.admin.createUser");

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

	const { name, role, status, country: countryId } = result.data;

	try {
		await createUser({
			name,
			role,
			status,
			countryId,
		});

		revalidatePath("/[locale]/dashboard/admin/users", "page");

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
