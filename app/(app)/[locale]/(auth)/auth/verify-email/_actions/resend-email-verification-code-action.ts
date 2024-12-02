"use server";

import { getTranslations } from "next-intl/server";

import {
	type ActionState,
	createErrorActionState,
	createSuccessActionState,
} from "@/lib/server/actions";
import { setEmailVerificationRequestCookie } from "@/lib/server/auth/email-verification-cookies";
import {
	createEmailVerificationRequest,
	getUserEmailVerificationRequestFromRequest,
	sendVerificationEmail,
	sendVerificationEmailBucket,
} from "@/lib/server/auth/email-verification-requests";
import { getCurrentSession } from "@/lib/server/auth/sessions";

export async function resendEmailVerificationCodeAction(): Promise<ActionState> {
	const t = await getTranslations("resendEmailVerificationCodeAction");
	const e = await getTranslations("errors");

	const { session, user } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return createErrorActionState({ message: e("forbidden") });
	}
	if (!sendVerificationEmailBucket.check(user.id, 1)) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest();

	if (verificationRequest == null) {
		if (user.emailVerified) {
			return createErrorActionState({ message: e("forbidden") });
		}
		if (!sendVerificationEmailBucket.consume(user.id, 1)) {
			return createErrorActionState({ message: e("too-many-requests") });
		}

		verificationRequest = await createEmailVerificationRequest(user.id, user.email);
	} else {
		if (!sendVerificationEmailBucket.consume(user.id, 1)) {
			return createErrorActionState({ message: e("too-many-requests") });
		}

		verificationRequest = await createEmailVerificationRequest(user.id, verificationRequest.email);
	}

	await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	await setEmailVerificationRequestCookie(verificationRequest);

	return createSuccessActionState({ message: t("new-code-sent") });
}
