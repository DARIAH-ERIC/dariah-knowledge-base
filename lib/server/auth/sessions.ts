import { getRandomValues } from "node:crypto";

import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { cache } from "react";

import { sessionMaxDurationMs, sessionRefreshIntervalMs } from "@/config/auth.config";
import { db } from "@/db";
import { type DbSession, sessionsTable, usersTable } from "@/db/schema";
import { getSessionToken } from "@/lib/server/auth/session-cookies";
import type { User } from "@/lib/server/auth/users";

export type Session = DbSession;

export type SessionFlags = Pick<Session, "twoFactorVerified">;

function createSessionIdFromSessionToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = createSessionIdFromSessionToken(token);

	const [row] = await db
		.select({ user: usersTable, session: sessionsTable })
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId));

	if (row == null) {
		return { session: null, user: null };
	}

	const session: Session = {
		id: row.session.id,
		userId: row.session.userId,
		expiresAt: row.session.expiresAt,
		twoFactorVerified: Boolean(row.session.twoFactorVerified),
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
		await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - sessionRefreshIntervalMs) {
		session.expiresAt = new Date(Date.now() + sessionMaxDurationMs);

		await db
			.update(sessionsTable)
			.set({ expiresAt: session.expiresAt })
			.where(eq(sessionsTable.id, session.id));
	}

	return { session, user };
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const token = await getSessionToken();

	if (token == null) {
		return { session: null, user: null };
	}

	const result = await validateSessionToken(token);

	return result;
});

export async function invalidateSession(sessionId: Session["id"]): Promise<void> {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
	await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}

/** Alternatively use uuid v4 from `crypto.randomUUID()`. */
export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();

	return token;
}

export async function createSession(
	token: string,
	userId: string,
	flags: SessionFlags,
): Promise<Session> {
	const sessionId = createSessionIdFromSessionToken(token);

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + sessionMaxDurationMs),
		twoFactorVerified: flags.twoFactorVerified,
	};

	await db.insert(sessionsTable).values({
		id: session.id,
		userId: session.userId,
		expiresAt: session.expiresAt,
		twoFactorVerified: session.twoFactorVerified,
	});

	return session;
}

export async function setSessionAs2FAVerified(sessionId: Session["id"]): Promise<void> {
	await db
		.update(sessionsTable)
		.set({ twoFactorVerified: true })
		.where(eq(sessionsTable.id, sessionId));
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
