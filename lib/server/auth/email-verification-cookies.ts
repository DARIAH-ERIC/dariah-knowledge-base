import { cookies } from "next/headers";

import { emailVerificationRequestCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";
import type { EmailVerificationRequest } from "@/lib/server/auth/email-verification-requests";

export async function getEmailVerificationRequestId(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(emailVerificationRequestCookieName)?.value ?? null;
}

export async function setEmailVerificationRequestCookie(
	request: EmailVerificationRequest,
): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(emailVerificationRequestCookieName, request.id, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: request.expiresAt,
		path: "/",
	});
}

export async function deleteEmailVerificationRequestCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(emailVerificationRequestCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
