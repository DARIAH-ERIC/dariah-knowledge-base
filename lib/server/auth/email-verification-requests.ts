import { getRandomValues } from "node:crypto";

import { encodeBase32 } from "@oslojs/encoding";
import { and, eq } from "drizzle-orm";

import { emailVerificationRequestMaxDurationMs } from "@/config/auth.config";
import { db } from "@/db";
import { type DbEmailVerificationRequest, emailVerificationRequestsTable } from "@/db/schema";
import {
	deleteEmailVerificationRequestCookie,
	getEmailVerificationRequestId,
} from "@/lib/server/auth/email-verification-cookies";
import { ExpiringTokenBucket } from "@/lib/server/auth/rate-limit";
import { getCurrentSession } from "@/lib/server/auth/sessions";
import type { User } from "@/lib/server/auth/users";
import { generateRandomOTP } from "@/lib/server/auth/utils";

export type EmailVerificationRequest = DbEmailVerificationRequest;

export async function getUserEmailVerificationRequest(
	userId: string,
	id: EmailVerificationRequest["id"],
): Promise<EmailVerificationRequest | null> {
	const [row] = await db
		.select()
		.from(emailVerificationRequestsTable)
		.where(
			and(
				eq(emailVerificationRequestsTable.id, id),
				eq(emailVerificationRequestsTable.userId, userId),
			),
		);

	if (row == null) {
		return null;
	}

	const request: EmailVerificationRequest = {
		id: row.id,
		userId: row.userId,
		code: row.code,
		email: row.email,
		expiresAt: row.expiresAt,
	};

	return request;
}

export async function createEmailVerificationRequest(
	userId: string,
	email: User["email"],
): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);

	const idBytes = new Uint8Array(20);
	getRandomValues(idBytes);
	const id = encodeBase32(idBytes).toLowerCase();

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + emailVerificationRequestMaxDurationMs);

	await db
		.insert(emailVerificationRequestsTable)
		.values({ id, userId, code, email, expiresAt })
		.returning({ id: emailVerificationRequestsTable.id });

	const request: EmailVerificationRequest = {
		id,
		userId,
		code,
		email,
		expiresAt,
	};

	return request;
}

export async function getUserEmailVerificationRequestFromRequest(): Promise<EmailVerificationRequest | null> {
	const { user } = await getCurrentSession();

	if (user == null) {
		return null;
	}

	const id = await getEmailVerificationRequestId();

	if (id == null) {
		return null;
	}

	const request = await getUserEmailVerificationRequest(user.id, id);

	if (request == null) {
		await deleteEmailVerificationRequestCookie();
	}

	return request;
}

export async function deleteUserEmailVerificationRequest(userId: string): Promise<void> {
	await db
		.delete(emailVerificationRequestsTable)
		.where(eq(emailVerificationRequestsTable.userId, userId));
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
	// eslint-disable-next-line no-console
	console.log(`To ${email}: Your verification code is ${code}`);
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<string>(3, 60 * 10);
