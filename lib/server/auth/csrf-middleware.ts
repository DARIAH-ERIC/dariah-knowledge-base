import { NextResponse } from "next/server";

import type { Middleware } from "@/lib/compose-middlewares";

/**
 * While Next.js provides built-in csrf protection for server actions, regular route handlers are
 * not protected. Therefore we implement csrf protection globally via middleware as a precaution.
 */
export const csrfMiddlware: Middleware = function csrfMiddlware(request, response) {
	if (request.method !== "GET") {
		const originHeader = request.headers.get("Origin");
		const hostHeader = request.headers.get("X-Forwarded-Host") ?? request.headers.get("Host");

		if (originHeader == null || hostHeader == null) {
			return new NextResponse(null, { status: 403 });
		}

		let origin: URL;

		try {
			origin = new URL(originHeader);
		} catch {
			return new NextResponse(null, { status: 403 });
		}

		if (origin.host !== hostHeader) {
			return new NextResponse(null, { status: 403 });
		}
	}

	return response;
};
