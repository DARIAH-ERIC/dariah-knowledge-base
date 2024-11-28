"use server";

import { getFormDataValues, log } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { env } from "@/config/env.config";
import {
	type ActionResult,
	createErrorActionResult,
	createSuccessActionResult,
} from "@/lib/server/actions";
import { sendEmail } from "@/lib/server/email/send-email";

const ContactFormSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	message: v.pipe(v.string(), v.nonEmpty()),
	subject: v.pipe(v.string(), v.nonEmpty()),
});

export async function sendContactFormEmailAction(
	state: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const result = await v.safeParseAsync(ContactFormSchema, getFormDataValues(formData));

	if (!result.success) {
		return createErrorActionResult({ message: "Invalid input" });
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

		return createErrorActionResult({ message: "Failed to send message." });
	}

	return createSuccessActionResult({ message: "Successfully sent message." });
}
