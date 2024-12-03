// eslint-disable-next-line check-file/folder-naming-convention
"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { verifyTOTP } from "@oslojs/otp";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { totpBucket } from "@/lib/server/auth/2fa";
import {
	setPasswordResetSessionAs2FAVerified,
	validatePasswordResetSessionRequest,
} from "@/lib/server/auth/password-reset-sessions";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { getUserTOTPKey } from "@/lib/server/auth/users";

const VerifyPasswordReset2faWithTOTPActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
});

export async function verifyPasswordReset2faWithTOTPAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("verifyPasswordReset2FAWithTOTPAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session, user } = await validatePasswordResetSessionRequest();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (!session.emailVerified || !user.registered2FA || session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!totpBucket.check(session.userId, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(
		VerifyPasswordReset2faWithTOTPActionInputSchema,
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

	const totpKey = await getUserTOTPKey(session.userId);
	if (totpKey == null) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!totpBucket.consume(session.userId, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}
	if (!verifyTOTP(totpKey, 30, 6, code)) {
		return createErrorActionState({ message: t("incorrect-code") });
	}

	totpBucket.reset(session.userId);

	await setPasswordResetSessionAs2FAVerified(session.id);

	return redirect({ href: urls.resetPassword, locale });
}
