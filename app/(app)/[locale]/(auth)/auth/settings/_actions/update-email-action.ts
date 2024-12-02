"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { setEmailVerificationRequestCookie } from "@/lib/server/auth/email-verification-cookies";
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	sendVerificationEmailBucket,
} from "@/lib/server/auth/email-verification-requests";
import { checkEmailAvailability } from "@/lib/server/auth/emails";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

const UpdateEmailActionInputSchema = v.object({
	email: v.pipe(v.string(), v.email()),
});

export async function updateEmailAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("updateEmailAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!sendVerificationEmailBucket.check(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(UpdateEmailActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { email } = result.output;

	const emailAvailable = await checkEmailAvailability(email);
	if (!emailAvailable) {
		return createErrorActionState({ message: t("email-in-use") });
	}
	if (!sendVerificationEmailBucket.consume(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const verificationRequest = await createEmailVerificationRequest(user.id, email);
	await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	await setEmailVerificationRequestCookie(verificationRequest);

	return redirect({ href: urls.verifyEmail, locale });
}
