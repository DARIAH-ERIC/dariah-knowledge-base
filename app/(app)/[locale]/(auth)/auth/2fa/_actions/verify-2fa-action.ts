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
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession, setSessionAs2FAVerified } from "@/lib/server/auth/sessions";
import { getUserTOTPKey } from "@/lib/server/auth/users";

const Verify2faActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
});

export async function verify2faAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("verify2FAAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (!user.emailVerified || !user.registered2FA || session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!totpBucket.check(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(Verify2faActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { code } = result.output;

	if (!totpBucket.consume(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const totpKey = await getUserTOTPKey(user.id);
	if (totpKey == null) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!verifyTOTP(totpKey, 30, 6, code)) {
		return createErrorActionState({ message: t("incorrect-code") });
	}

	totpBucket.reset(user.id);

	await setSessionAs2FAVerified(session.id);

	return redirect({ href: urls.afterSignIn, locale });
}
