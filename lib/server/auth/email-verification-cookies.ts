import { cookies } from "next/headers";

import { emailVerificationRequestCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";
import type { EmailVerificationRequest } from "@/lib/server/auth/email-verification-requests";

// eslint-disable-next-line @typescript-eslint/require-await
export async function getEmailVerificationRequestId(): Promise<string | null> {
	return cookies().get(emailVerificationRequestCookieName)?.value ?? null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function setEmailVerificationRequestCookie(
	request: EmailVerificationRequest,
): Promise<void> {
	cookies().set(emailVerificationRequestCookieName, request.id, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: request.expiresAt,
		path: "/",
	});
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function deleteEmailVerificationRequestCookie(): Promise<void> {
	cookies().set(emailVerificationRequestCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
