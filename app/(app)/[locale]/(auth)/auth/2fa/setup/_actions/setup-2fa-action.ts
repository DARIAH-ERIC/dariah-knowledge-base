// eslint-disable-next-line check-file/folder-naming-convention
"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { decodeBase64 } from "@oslojs/encoding";
import { verifyTOTP } from "@oslojs/otp";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { RefillingTokenBucket } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { getCurrentSession, setSessionAs2FAVerified } from "@/lib/server/auth/sessions";
import { updateUserTOTPKey } from "@/lib/server/auth/users";

const totpUpdateBucket = new RefillingTokenBucket<string>(3, 60 * 10);

const Setup2faActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
	key: v.pipe(v.string(), v.nonEmpty()),
});

const TOTPKeySchema = v.pipe(
	v.string(),
	v.length(28),
	v.transform(decodeBase64),
	v.check((key) => {
		return key.byteLength === 20;
	}),
);

export async function setup2faAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("setup2FAAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (!user.emailVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!totpUpdateBucket.check(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(Setup2faActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { code, key: encryptedKey } = result.output;

	const keyResult = await v.safeParseAsync(TOTPKeySchema, encryptedKey);

	if (!keyResult.success) {
		return createErrorActionState({ message: t("invalid-key") });
	}

	const key = keyResult.output;

	if (!totpUpdateBucket.consume(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}
	if (!verifyTOTP(key, 30, 6, code)) {
		return createErrorActionState({ message: t("invalid-code") });
	}

	await updateUserTOTPKey(session.userId, key);
	await setSessionAs2FAVerified(session.id);

	return redirect({ href: urls.recoveryCode, locale });
}
