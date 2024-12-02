"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { deleteEmailVerificationRequestCookie } from "@/lib/server/auth/email-verification-cookies";
import {
	createEmailVerificationRequest,
	deleteUserEmailVerificationRequest,
	getUserEmailVerificationRequestFromRequest,
	sendVerificationEmail,
} from "@/lib/server/auth/email-verification-requests";
import { invalidateUserPasswordResetSessions } from "@/lib/server/auth/password-reset-sessions";
import { ExpiringTokenBucket } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";
import { updateUserEmailAndSetEmailAsVerified } from "@/lib/server/auth/users";

const bucket = new ExpiringTokenBucket<string>(5, 60 * 30);

const VerifyEmailActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
});

export async function verifyEmailAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("verifyEmailAction");
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
	if (!bucket.check(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest();

	if (verificationRequest == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}

	const result = await v.safeParseAsync(VerifyEmailActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { code } = result.output;

	if (!bucket.consume(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	if (Date.now() >= verificationRequest.expiresAt.getTime()) {
		verificationRequest = await createEmailVerificationRequest(
			verificationRequest.userId,
			verificationRequest.email,
		);

		await sendVerificationEmail(verificationRequest.email, verificationRequest.code);

		return createErrorActionState({
			message: t("code-expired"),
		});
	}

	if (verificationRequest.code !== code) {
		return createErrorActionState({ message: t("incorrect-code") });
	}

	await deleteUserEmailVerificationRequest(user.id);
	await invalidateUserPasswordResetSessions(user.id);
	await updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
	await deleteEmailVerificationRequestCookie();

	if (!user.registered2FA) {
		return redirect({ href: urls["2faSetup"], locale });
	}

	return redirect({ href: urls.afterSignIn, locale });
}
