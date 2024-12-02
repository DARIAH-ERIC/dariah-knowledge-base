"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import {
	setPasswordResetSessionAsEmailVerified,
	validatePasswordResetSessionRequest,
} from "@/lib/server/auth/password-reset-sessions";
import { ExpiringTokenBucket } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { setUserAsEmailVerifiedIfEmailMatches } from "@/lib/server/auth/users";

const emailVerificationBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

const VerifyPasswordResetEmailActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
});

export async function verifyPasswordResetEmailAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("verifyPasswordResetEmailAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session } = await validatePasswordResetSessionRequest();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (session.emailVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!emailVerificationBucket.check(session.userId, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(
		VerifyPasswordResetEmailActionInputSchema,
		getFormDataValues(formData),
	);

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { code } = result.output;

	if (!emailVerificationBucket.consume(session.userId, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}
	if (code !== session.code) {
		return createErrorActionState({ message: t("incorrect-code") });
	}

	emailVerificationBucket.reset(session.userId);
	await setPasswordResetSessionAsEmailVerified(session.id);

	const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(session.userId, session.email);
	if (!emailMatches) {
		return createErrorActionState({ message: t("restart") });
	}

	return redirect({ href: urls.resetPassword2fa, locale });
}
