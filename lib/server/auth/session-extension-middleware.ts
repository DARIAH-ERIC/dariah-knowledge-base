import { sessionCookieName, sessionMaxDurationMs } from "@/config/auth.config";
import { env } from "@/config/env.config";
import type { Middleware } from "@/lib/compose-middlewares";

/**
 * Since we can't extend set cookies insides server components, we continuously extend the
 * cookie expiration inside middleware.
 * However, we can't detect if a new cookie was set inside server actions or route handlers
 * from middleware. This becomes an issue if we need to assign a new session inside server actions
 * (e.g. after updating the password) as the middleware cookie will override it.
 * As such, we'll only extend the cookie expiration on GET requests.
 */
export const sessionExtensionMiddleware: Middleware = function sessionExtensionMiddleware(
	request,
	response,
) {
	/**
	 * Only extend cookie expiration on GET requests since we can be sure a new session wasn't set
	 * when handling the request.
	 */
	if (request.method === "GET") {
		const token = request.cookies.get(sessionCookieName)?.value;

		if (token != null) {
			response.cookies.set(sessionCookieName, token, {
				httpOnly: true,
				sameSite: "lax",
				secure: env.NODE_ENV === "production",
				maxAge: Math.floor(sessionMaxDurationMs / 1000),
				path: "/",
			});
		}
	}

	return response;
};
