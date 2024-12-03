"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { urls } from "@/config/auth.config";
import { redirect } from "@/lib/i18n/navigation";
import { type ActionState, createErrorActionState } from "@/lib/server/actions";
import { globalPOSTRateLimit } from "@/lib/server/auth/requests";
import { deleteSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import { getCurrentSession, invalidateSession } from "@/lib/server/auth/sessions";

export async function signOutAction(): Promise<ActionState> {
	const locale = await getLocale();
	const e = await getTranslations("errors");

	if (!(await globalPOSTRateLimit())) {
		return createErrorActionState({ message: e("too-many-requests") });
	}

	const { session } = await getCurrentSession();

	if (session == null) {
		return createErrorActionState({ message: e("not-authenticated") });
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();

	return redirect({ href: urls.signIn, locale });
}
