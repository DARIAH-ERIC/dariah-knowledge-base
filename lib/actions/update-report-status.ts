"use server";

import { log } from "@acdh-oeaw/lib";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { calculateOperationalCost } from "@/lib/calculate-operational-cost";
import {
	getReportComments,
	updateReportCalculation,
	updateReportComments,
	updateReportStatus,
} from "@/lib/data/report";
import { getFormData } from "@/lib/get-form-data";
import type { ReportCommentsSchema } from "@/lib/schemas/report";

const formSchema = z.object({
	comment: z.string().optional(),
	countryId: z.string(),
	reportId: z.string(),
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

export async function updateReportStatusAction(
	previousFormState: FormState | undefined,
	formData: FormData,
): Promise<FormState> {
	const t = await getTranslations("actions.updateReport");

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

	const { comment, countryId, reportId } = result.data;

	try {
		const report = await getReportComments({ id: reportId });
		const comments = report?.comments as ReportCommentsSchema | undefined;
		await updateReportComments({ id: reportId, comments: { ...comments, confirmation: comment } });

		await updateReportStatus({ id: reportId });

		const calculation = await calculateOperationalCost({ countryId, reportId });
		await updateReportCalculation({
			id: reportId,
			operationalCost: new Prisma.Decimal(calculation.operationalCost),
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			operationalCostDetail: calculation as any,
		});

		revalidatePath("/[locale]/dashboard/reports/[year]/countries/[code]/edit/confirm", "page");

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
