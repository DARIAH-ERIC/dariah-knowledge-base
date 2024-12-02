"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { setPasswordResetSessionTokenCookie } from "@/lib/server/auth/password-reset-cookies";
import {
	createPasswordResetSession,
	invalidateUserPasswordResetSessions,
	sendPasswordResetEmail,
} from "@/lib/server/auth/password-reset-sessions";
import { RefillingTokenBucket } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { generateSessionToken } from "@/lib/server/auth/sessions";
import { getUserFromEmail } from "@/lib/server/auth/users";

const passwordResetEmailIPBucket = new RefillingTokenBucket<string>(3, 60);
const passwordResetEmailUserBucket = new RefillingTokenBucket<string>(3, 60);

const ForgotPasswordActionInputSchema = v.object({
	email: v.pipe(v.string(), v.email()),
});

export async function forgotPasswordAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("forgotPasswordAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	/**
	 * Assumes `x-forwarded-for` header will always be defined.
	 *
	 * In acdh-ch infrastructure, `x-forwarded-for` actually holds the ip of the nginx ingress.
	 * Ask a sysadmin to enable "proxy-protocol" in haproxy to receive actual ip addresses.
	 */
	const clientIP = (await headers()).get("X-Forwarded-For");
	if (clientIP != null && !passwordResetEmailIPBucket.check(clientIP, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(
		ForgotPasswordActionInputSchema,
		getFormDataValues(formData),
	);

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { email } = result.output;

	const user = await getUserFromEmail(email);
	if (user == null) {
		return createErrorActionState({ message: t("invalid-account") });
	}

	if (clientIP != null && !passwordResetEmailIPBucket.consume(clientIP, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}
	if (!passwordResetEmailUserBucket.consume(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	await invalidateUserPasswordResetSessions(user.id);
	const sessionToken = generateSessionToken();
	const session = await createPasswordResetSession(sessionToken, user.id, user.email);

	await sendPasswordResetEmail(session.email, session.code);
	await setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);

	return redirect({ href: urls.resetPasswordVerifyEmail, locale });
}
