import { sessionCookieMaxAgeSeconds, sessionCookieName } from "@/config/auth.config";
import { env } from "@/config/env.config";
import type { Middleware } from "@/lib/server/compose-middlewares";

export const middleware: Middleware = function middleware(request, response) {
	if (request.method === "GET") {
		const token = request.cookies.get(sessionCookieName)?.value;

		if (token != null) {
			response.cookies.set(sessionCookieName, token, {
				httpOnly: true,
				sameSite: "lax",
				secure: env.NODE_ENV === "production",
				maxAge: sessionCookieMaxAgeSeconds,
				path: "/",
			});
		}
	}

	return response;
};
