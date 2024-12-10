import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import {
	type AuthenticatedSession,
	type SessionValidationResult,
} from "@/lib/server/auth/sessions";

export function assertAuthenticatedSession(
	params: SessionValidationResult,
	locale: Locale,
): asserts params is AuthenticatedSession {
	const { session, user } = params;

	if (session == null) {
		return redirect({ href: urls.signIn, locale });
	}

	if (!user.emailVerified) {
		return redirect({ href: urls.verifyEmail, locale });
	}

	if (!user.registered2FA) {
		return redirect({ href: urls["2faSetup"], locale });
	}

	if (!session.twoFactorVerified) {
		return redirect({ href: urls["2fa"], locale });
	}
}
