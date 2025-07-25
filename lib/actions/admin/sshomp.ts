"use server";

import { log } from "@acdh-oeaw/lib";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { z, ZodTypeAny } from "zod";

import { ingestDataFromSshomp } from "@/lib/db/ingest-data-from-sshomp";
import { assertAuthenticated } from "@/lib/server/auth/assert-authenticated";

interface FormReturnValue {
	timestamp: number;
}

interface FormErrors extends FormReturnValue, z.typeToFlattenedError<ZodTypeAny> {
	status: "error";
}

interface FormSuccess extends FormReturnValue {
	status: "success";
	message: string;
}

type FormState = FormErrors | FormSuccess;

export async function ingestDataFromSshompAction(
	_previousFormState: FormState | undefined,
	_formData: FormData,
): Promise<FormState> {
	const t = await getTranslations("actions.ingestDataFromSshomp");

	await assertAuthenticated(["admin"]);

	try {
		const stats = await ingestDataFromSshomp();

		revalidatePath("/[locale]/dashboard/admin/sshomp", "page");

		return {
			status: "success" as const,
			message: `${t("success")}\n${JSON.stringify(stats)}`, // TODO:
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
