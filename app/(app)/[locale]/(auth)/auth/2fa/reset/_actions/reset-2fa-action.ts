// eslint-disable-next-line check-file/folder-naming-convention
"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { recoveryCodeBucket, resetUser2FAWithRecoveryCode } from "@/lib/server/auth/2fa";
import { getCurrentSession } from "@/lib/server/auth/sessions";

const Reset2faActionInputSchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
});

export async function reset2faAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("reset2FAAction");
	const e = await getTranslations("errors");

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (!user.emailVerified || !user.registered2FA || session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!recoveryCodeBucket.check(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(Reset2faActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { code } = result.output;

	if (!recoveryCodeBucket.consume(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const valid = await resetUser2FAWithRecoveryCode(user.id, code);
	if (!valid) {
		return createErrorActionState({ message: t("invalid-code") });
	}

	recoveryCodeBucket.reset(user.id);

	return redirect({ href: urls["2faSetup"], locale });
}
