import { headers } from "next/headers";

import { RefillingTokenBucket } from "@/lib/server/auth/rate-limit";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export function globalGETRateLimit(): boolean {
	/**
	 * Assumes `x-forwarded-for` header will always be defined.
	 *
	 * In acdh-ch infrastructure, `x-forwarded-for` actually holds the ip of the nginx ingress.
	 * Ask a sysadmin to enable "proxy-protocol" in haproxy to receive actual ip addresses.
	 */
	const clientIP = headers().get("X-Forwarded-For");

	if (clientIP == null) {
		return true;
	}

	return globalBucket.consume(clientIP, 1);
}

export function globalPOSTRateLimit(): boolean {
	/**
	 * Assumes `x-forwarded-for` header will always be defined.
	 *
	 * In acdh-ch infrastructure, `x-forwarded-for` actually holds the ip of the nginx ingress.
	 * Ask a sysadmin to enable "proxy-protocol" in haproxy to receive actual ip addresses.
	 */
	const clientIP = headers().get("X-Forwarded-For");

	if (clientIP == null) {
		return true;
	}

	return globalBucket.consume(clientIP, 3);
}
