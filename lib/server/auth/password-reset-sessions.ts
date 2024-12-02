import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";

import { passwordResetSessionMaxDurationMs } from "@/config/auth.config";
import { db } from "@/db";
import { type DbPasswordResetSession, passwordResetSessionsTable, usersTable } from "@/db/schema";
import {
	deletePasswordResetSessionTokenCookie,
	getPasswordResetSessionToken,
} from "@/lib/server/auth/password-reset-cookies";
import type { User } from "@/lib/server/auth/users";
import { generateRandomOTP } from "@/lib/server/auth/utils";

export type PasswordResetSession = DbPasswordResetSession;

export async function createPasswordResetSession(
	token: string,
	userId: string,
	email: string,
): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + passwordResetSessionMaxDurationMs),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false,
	};

	await db.insert(passwordResetSessionsTable).values({
		id: session.id,
		userId: session.userId,
		email: session.email,
		code: session.code,
		expiresAt: session.expiresAt,
	});

	return session;
}

export async function validatePasswordResetSessionToken(
	token: string,
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const [row] = await db
		.select({ passwordResetSession: passwordResetSessionsTable, user: usersTable })
		.from(passwordResetSessionsTable)
		.innerJoin(usersTable, eq(passwordResetSessionsTable.userId, usersTable.id))
		.where(eq(passwordResetSessionsTable.id, sessionId));

	if (row == null) {
		return { session: null, user: null };
	}

	const session: PasswordResetSession = {
		id: row.passwordResetSession.id,
		userId: row.passwordResetSession.userId,
		email: row.passwordResetSession.email,
		code: row.passwordResetSession.code,
		expiresAt: row.passwordResetSession.expiresAt,
		emailVerified: row.passwordResetSession.emailVerified,
		twoFactorVerified: row.passwordResetSession.twoFactorVerified,
	};

	const user: User = {
		id: row.user.id,
		email: row.user.email,
		username: row.user.username,
		role: row.user.role,
		emailVerified: row.user.emailVerified,
		registered2FA: row.user.totpKey != null,
	};

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(passwordResetSessionsTable).where(eq(passwordResetSessionsTable.id, sessionId));

		return { session: null, user: null };
	}

	return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSessionsTable)
		.set({ emailVerified: true })
		.where(eq(passwordResetSessionsTable.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSessionsTable)
		.set({ twoFactorVerified: true })
		.where(eq(passwordResetSessionsTable.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: string): Promise<void> {
	await db.delete(passwordResetSessionsTable).where(eq(passwordResetSessionsTable.userId, userId));
}

export async function validatePasswordResetSessionRequest(): Promise<PasswordResetSessionValidationResult> {
	const token = await getPasswordResetSessionToken();

	if (token == null) {
		return { session: null, user: null };
	}

	const result = await validatePasswordResetSessionToken(token);

	if (result.session == null) {
		await deletePasswordResetSessionTokenCookie();
	}

	return result;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
	// eslint-disable-next-line no-console
	console.log(`To ${email}: Your reset code is ${code}`);
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: User }
	| { session: null; user: null };
