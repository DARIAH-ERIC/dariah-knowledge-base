import { createUrl, request } from "@acdh-oeaw/lib";
import { hash, verify } from "@node-rs/argon2";
import { sha1 } from "@oslojs/crypto/sha1";
import { encodeHexLowerCase } from "@oslojs/encoding";

import { argonConfig, passwordMaxLength, passwordMinLength } from "@/config/auth.config";

export async function hashPassword(password: string): Promise<string> {
	return await hash(password, argonConfig);
}

export async function verifyPasswordHash(hash: string, password: string): Promise<boolean> {
	return await verify(hash, password);
}

export async function verifyPasswordStrength(password: string): Promise<boolean> {
	if (password.length < passwordMinLength || password.length > passwordMaxLength) {
		return false;
	}

	const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
	const hashPrefix = hash.slice(0, 5);

	const url = createUrl({
		baseUrl: "https://api.pwnedpasswords.com",
		pathname: `/range/${hashPrefix}`,
	});

	const data = (await request(url, {
		responseType: "text",
	})) as string;

	const items = data.split("\n");

	for (const item of items) {
		const hashSuffix = item.slice(0, 35).toLowerCase();
		if (hash === hashPrefix + hashSuffix) {
			return false;
		}
	}

	return true;
}
