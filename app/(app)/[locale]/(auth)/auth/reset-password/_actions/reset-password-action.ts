"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { passwordMaxLength, passwordMinLength, urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { deletePasswordResetSessionTokenCookie } from "@/lib/server/auth/password-reset-cookies";
import {
	invalidateUserPasswordResetSessions,
	validatePasswordResetSessionRequest,
} from "@/lib/server/auth/password-reset-sessions";
import { verifyPasswordStrength } from "@/lib/server/auth/passwords";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { setSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import {
	createSession,
	generateSessionToken,
	invalidateUserSessions,
	type SessionFlags,
} from "@/lib/server/auth/sessions";
import { updateUserPassword } from "@/lib/server/auth/users";

const ResetPasswordActionInputSchema = v.pipe(
	v.object({
		password: v.pipe(v.string(), v.minLength(passwordMinLength), v.maxLength(passwordMaxLength)),
		"password-confirmation": v.pipe(v.string(), v.nonEmpty()),
	}),
	v.forward(
		v.check((input) => {
			return input["password-confirmation"] === input.password;
		}, "Passwords don't match."),
		["password-confirmation"],
	),
);

export async function resetPasswordAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("resetPasswordAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session: passwordResetSession, user } = await validatePasswordResetSessionRequest();

	if (passwordResetSession == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (!passwordResetSession.emailVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (user.registered2FA && !passwordResetSession.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}

	const result = await v.safeParseAsync(
		ResetPasswordActionInputSchema,
		getFormDataValues(formData),
	);

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { password } = result.output;

	const strongPassword = await verifyPasswordStrength(password);
	if (!strongPassword) {
		return createErrorActionState({ message: t("weak-password") });
	}

	await invalidateUserPasswordResetSessions(passwordResetSession.userId);
	await invalidateUserSessions(passwordResetSession.userId);
	await updateUserPassword(passwordResetSession.userId, password);

	const sessionFlags: SessionFlags = { twoFactorVerified: passwordResetSession.twoFactorVerified };
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	await setSessionTokenCookie(sessionToken, session.expiresAt);
	await deletePasswordResetSessionTokenCookie();

	return redirect({ href: urls.afterSignIn, locale });
}
