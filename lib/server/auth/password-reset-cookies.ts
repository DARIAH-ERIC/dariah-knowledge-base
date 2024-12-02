import { cookies } from "next/headers";

import { passwordResetCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";

// eslint-disable-next-line @typescript-eslint/require-await
export async function getPasswordResetSessionToken(): Promise<string | null> {
	return cookies().get(passwordResetCookieName)?.value ?? null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function setPasswordResetSessionTokenCookie(
	token: string,
	expiresAt: Date,
): Promise<void> {
	cookies().set(passwordResetCookieName, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/",
	});
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function deletePasswordResetSessionTokenCookie(): Promise<void> {
	cookies().set(passwordResetCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
