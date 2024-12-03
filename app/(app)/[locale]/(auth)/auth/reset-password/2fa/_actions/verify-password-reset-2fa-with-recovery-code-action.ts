// eslint-disable-next-line check-file/folder-naming-convention
"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { recoveryCodeBucket, resetUser2FAWithRecoveryCode } from "@/lib/server/auth/2fa";
import { validatePasswordResetSessionRequest } from "@/lib/server/auth/password-reset-sessions";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";

const VerifyPasswordReset2faWithRecoveryCodeActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
});

export async function verifyPasswordReset2faWithRecoveryCodeAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("verifyPasswordReset2FAWithRecoveryCodeAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session, user } = await validatePasswordResetSessionRequest();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (!session.emailVerified || !user.registered2FA || session.twoFactorVerified) {
		return createErrorActionState({ message: "Forbidden" });
	}

	if (!recoveryCodeBucket.check(session.userId, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(
		VerifyPasswordReset2faWithRecoveryCodeActionInputSchema,
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

	if (!recoveryCodeBucket.consume(session.userId, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const valid = await resetUser2FAWithRecoveryCode(session.userId, code);
	if (!valid) {
		return createErrorActionState({ message: t("incorrect-code") });
	}

	recoveryCodeBucket.reset(session.userId);

	return redirect({ href: urls.resetPassword, locale });
}
