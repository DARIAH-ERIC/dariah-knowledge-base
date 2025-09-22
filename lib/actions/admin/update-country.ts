"use server";

import { log } from "@acdh-oeaw/lib";
import { CountryType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { updateCountry } from "@/lib/data/country";
import { getFormData } from "@/lib/get-form-data";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

const formSchema = z.object({
	id: z.string(),
	name: z.string(),
	code: z.string(),
	description: z.string().optional(),
	logo: z.string().optional(),
	marketplaceId: z.coerce.number().int().positive().optional(),
	type: z.enum(Object.values(CountryType) as [CountryType, ...Array<CountryType>]).optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
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

export async function updateCountryAction(
	previousFormState: FormState | undefined,
	formData: FormData,
): Promise<FormState> {
	const t = await getTranslations("actions.admin.updateCountry");

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

	const { id, code, logo, marketplaceId, name, description, endDate, startDate, type } =
		result.data;

	try {
		await updateCountry({
			id,
			name,
			code,
			logo,
			marketplaceId,
			type,
			startDate,
			endDate,
			description,
		});

		revalidatePath("/[locale]/dashboard/admin/countries", "page");
		revalidatePath(`/[locale]/dashboard/admin/countries/${code}`, "page");

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
