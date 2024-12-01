"use server";

import { getFormDataValues, log } from "@acdh-oeaw/lib";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { env } from "@/config/env.config";
import { isValidFormSubmission } from "@/lib/honeypot";
import {
	type ActionState,
	createErrorActionState,
	createSuccessActionState,
} from "@/lib/server/actions";
import { sendEmail } from "@/lib/server/email/send-email";

const ContactFormSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	message: v.pipe(v.string(), v.nonEmpty()),
	subject: v.pipe(v.string(), v.nonEmpty()),
});

export async function sendContactFormEmailAction(
	state: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const t = await getTranslations("sendContactFormEmailAction");

	// TODO: rate limit

	if (!isValidFormSubmission(formData)) {
		return createErrorActionState({ message: t("invalid-input") });
	}

	const result = await v.safeParseAsync(ContactFormSchema, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionState({ message: t("invalid-input") });
	}

	const { email, message, subject } = result.output;

	try {
		await sendEmail({
			from: email,
			to: env.EMAIL_ADDRESS,
			subject,
			text: message,
		});
	} catch (error) {
		log.error(String(error));

		return createErrorActionState({ message: t("error") });
	}

	return createSuccessActionState({ message: t("success") });
}
