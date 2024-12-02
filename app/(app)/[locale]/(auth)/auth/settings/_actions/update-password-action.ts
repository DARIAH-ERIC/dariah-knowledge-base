"use server";

import { getFormDataValues } from "@acdh-oeaw/lib";
import { getTranslations } from "next-intl/server";
import * as v from "valibot";

import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { verifyPasswordHash, verifyPasswordStrength } from "@/lib/server/auth/passwords";
import { ExpiringTokenBucket } from "@/lib/server/auth/rate-limit";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { setSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import {
	createSession,
	generateSessionToken,
	getCurrentSession,
	invalidateUserSessions,
	type SessionFlags,
} from "@/lib/server/auth/sessions";
import { getUserPasswordHash, updateUserPassword } from "@/lib/server/auth/users";

const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

const UpdatePasswordActionInputSchema = v.pipe(
	v.object({
		password: v.pipe(v.string(), v.nonEmpty()),
		"new-password": v.pipe(v.string(), v.nonEmpty()),
		"new-password-confirmation": v.pipe(v.string(), v.nonEmpty()),
	}),
	v.forward(
		v.check((input) => {
			return input["new-password-confirmation"] === input["new-password"];
		}, "Passwords don't match."),
		["new-password-confirmation"],
	),
);

export async function updatePasswordAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const t = await getTranslations("updatePasswordAction");
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!passwordUpdateBucket.check(session.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const result = await v.safeParseAsync(
		UpdatePasswordActionInputSchema,
		getFormDataValues(formData),
	);

	if (!result.success) {
		const errors = v.flatten(result.issues);

		return createErrorActionState({
			message: errors.root ?? e("invalid-form-fields"),
			errors: errors.nested,
		});
	}

	const { password, "new-password": newPassword } = result.output;

	const strongPassword = await verifyPasswordStrength(newPassword);
	if (!strongPassword) {
		return createErrorActionState({ message: t("weak-password") });
	}

	if (!passwordUpdateBucket.consume(session.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const passwordHash = await getUserPasswordHash(user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return createErrorActionState({ message: t("incorrect-password") });
	}

	passwordUpdateBucket.reset(session.id);

	await invalidateUserSessions(user.id);
	await updateUserPassword(user.id, newPassword);

	const sessionToken = generateSessionToken();
	const sessionFlags: SessionFlags = { twoFactorVerified: session.twoFactorVerified };
	const newSession = await createSession(sessionToken, user.id, sessionFlags);
	await setSessionTokenCookie(sessionToken, newSession.expiresAt);

	return createErrorActionState({ message: t("password-updated") });
}
