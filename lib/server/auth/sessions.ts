import "server-only";

import type { Session as DbSession, User as DbUser } from "@prisma/client";

import { activityCheckIntervalSeconds, inactivityTimeoutSeconds } from "@/config/auth.config";
import { db } from "@/lib/db";
import { constantTimeEqual, generateSecureRandomString, hashSecret } from "@/lib/server/auth/utils";

export type Session = DbSession;

export type User = Pick<DbUser, "id" | "email" | "name" | "role" | "countryId">;

export interface SessionValidationResultSuccess {
	session: Session;
	user: User;
}

export interface SessionValidationResultError {
	session: null;
	user: null;
}

export type SessionValidationResult = SessionValidationResultSuccess | SessionValidationResultError;

export async function createSession(userId: string): Promise<{ session: Session; token: string }> {
	const now = new Date();

	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();
	const secretHash = await hashSecret(secret);

	const token = `${id}.${secret}`;

	const session = {
		id,
		secretHash,
		userId,
		createdAt: now,
		lastVerifiedAt: now,
	};

	await db.session.create({
		data: session,
	});

	return { session, token };
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const now = new Date();

	const [sessionId, sessionSecret] = token.split(".");
	if (sessionId == null || sessionSecret == null) {
		return { session: null, user: null };
	}

	const result = await db.session.findFirst({
		where: { id: sessionId },
		select: {
			id: true,
			secretHash: true,
			createdAt: true,
			lastVerifiedAt: true,
			user: {
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					countryId: true,
				},
			},
		},
	});

	if (result == null) {
		return { session: null, user: null };
	}

	const session = {
		id: result.id,
		secretHash: result.secretHash,
		userId: result.user.id,
		createdAt: result.createdAt,
		lastVerifiedAt: result.lastVerifiedAt,
	};

	const user = {
		id: result.user.id,
		email: result.user.email,
		name: result.user.name,
		role: result.user.role,
		countryId: result.user.countryId,
	};

	if (now.getTime() - session.lastVerifiedAt.getTime() >= inactivityTimeoutSeconds * 1000) {
		await deleteSession(sessionId);
		return { session: null, user: null };
	}

	const tokenSecretHash = await hashSecret(sessionSecret);
	const isValidSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
	if (!isValidSecret) {
		return { session: null, user: null };
	}

	/** Inactivity timeout. */
	if (now.getTime() - session.lastVerifiedAt.getTime() >= activityCheckIntervalSeconds * 1000) {
		session.lastVerifiedAt = now;
		await db.session.update({
			where: { id: sessionId },
			data: { lastVerifiedAt: session.lastVerifiedAt },
		});
	}

	return { session, user };
}

export async function deleteSession(sessionId: string): Promise<void> {
	await db.session.delete({ where: { id: sessionId } });
}

export async function deleteUserSessions(userId: string): Promise<void> {
	await db.session.deleteMany({ where: { userId } });
}
