"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import {
	passwordMaxLength,
	passwordMinLength,
	urls,
	usernameMaxLength,
	usernameMinLength,
} from "@/config/auth.config";
import { env } from "@/config/env.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { setEmailVerificationRequestCookie } from "@/lib/server/auth/email-verification-cookies";
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
} from "@/lib/server/auth/email-verification-requests";
import { checkEmailAvailability } from "@/lib/server/auth/emails";
import { verifyPasswordStrength } from "@/lib/server/auth/passwords";
import { RefillingTokenBucket } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { setSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import { createSession, generateSessionToken, type SessionFlags } from "@/lib/server/auth/sessions";
import { createUser } from "@/lib/server/auth/users";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

const SignUpActionInputSchema = v.pipe(
	v.object({
		email: v.pipe(v.string(), v.email(), v.toLowerCase()),
		username: v.pipe(v.string(), v.minLength(usernameMinLength), v.maxLength(usernameMaxLength)),
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

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("signUpAction");
	const e = await getTranslations("errors");

	if (env.AUTH_SIGN_UP !== "enabled") {
		return createErrorActionState({ message: t("sign-up-disabled") });
	}

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
	if (clientIP != null && !ipBucket.check(clientIP, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(SignUpActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { email, password, username } = result.output;

	const emailAvailable = await checkEmailAvailability(email);
	if (!emailAvailable) {
		return createErrorActionState({ message: t("email-in-use") });
	}

	const strongPassword = await verifyPasswordStrength(password);
	if (!strongPassword) {
		return createErrorActionState({ message: t("weak-password") });
	}

	if (clientIP != null && !ipBucket.consume(clientIP, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const user = await createUser(email, username, password);
	const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
	await sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
	await setEmailVerificationRequestCookie(emailVerificationRequest);

	const sessionFlags: SessionFlags = { twoFactorVerified: false };
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	await setSessionTokenCookie(sessionToken, session.expiresAt);

	return redirect({ href: urls["2faSetup"], locale });
}
