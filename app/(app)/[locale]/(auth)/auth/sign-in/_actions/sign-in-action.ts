"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import * as v from "valibot";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { verifyPasswordHash } from "@/lib/server/auth/passwords";
import { RefillingTokenBucket, Throttler } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { setSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import { createSession, generateSessionToken, type SessionFlags } from "@/lib/server/auth/sessions";
import { getUserFromEmail, getUserPasswordHash } from "@/lib/server/auth/users";

const throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

const SignInActionInputSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.nonEmpty()),
});

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
	const locale = await getLocale();
	const t = await getTranslations("signInAction");
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
	if (clientIP != null && !ipBucket.check(clientIP, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(SignInActionInputSchema, getFormDataValues(formData));

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { email, password } = result.output;

	const user = await getUserFromEmail(email);
	if (user == null) {
		return createErrorActionState({ message: t("invalid-account") });
	}

	if (clientIP != null && !ipBucket.consume(clientIP, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}
	if (!throttler.consume(user.id)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const passwordHash = await getUserPasswordHash(user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return createErrorActionState({ message: t("incorrect-password") });
	}

	throttler.reset(user.id);

	const sessionFlags: SessionFlags = { twoFactorVerified: false };
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	await setSessionTokenCookie(sessionToken, session.expiresAt);

	if (!user.emailVerified) {
		return redirect({ href: urls.verifyEmail, locale });
	}

	if (!user.registered2FA) {
		return redirect({ href: urls["2faSetup"], locale });
	}

	return redirect({ href: urls["2fa"], locale });
}
