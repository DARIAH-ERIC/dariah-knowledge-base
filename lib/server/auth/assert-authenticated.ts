import type { UserRole } from "@prisma/client";
import { getLocale } from "next-intl/server";

import { redirect } from "@/lib/navigation/navigation";
import { getCurrentSession } from "@/lib/server/auth/get-current-session";
import type { SessionValidationResultSuccess } from "@/lib/server/auth/sessions";

export async function assertAuthenticated(
	roles?: Array<UserRole>,
): Promise<SessionValidationResultSuccess> {
	const locale = await getLocale();

	const { session, user } = await getCurrentSession();

	if (session == null) {
		redirect({ href: "/auth/sign-in", locale });
	}

	if (roles != null && !roles.includes(user.role)) {
		redirect({ href: "/auth/sign-in", locale });
	}

	return { session, user };
}
