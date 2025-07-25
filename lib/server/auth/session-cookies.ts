import { cookies } from "next/headers";

import { sessionCookieMaxAgeSeconds, sessionCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";

export async function getSessionToken(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(sessionCookieName)?.value ?? null;
}

export async function setSessionTokenCookie(token: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(sessionCookieName, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: sessionCookieMaxAgeSeconds,
		path: "/",
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(sessionCookieName, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
