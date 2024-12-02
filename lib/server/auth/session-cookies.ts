import { cookies } from "next/headers";

import { sessionCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";

// eslint-disable-next-line @typescript-eslint/require-await
export async function getSessionToken(): Promise<string | null> {
	return cookies().get(sessionCookieName)?.value ?? null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	cookies().set(sessionCookieName, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/",
	});
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function deleteSessionTokenCookie(): Promise<void> {
	cookies().set(sessionCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
