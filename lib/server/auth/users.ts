import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { type DbUser, usersTable } from "@/db/schema";
import { decrypt, decryptToString, encrypt, encryptString } from "@/lib/server/auth/encryption";
import { InvalidUserIdError } from "@/lib/server/auth/errors";
import { hashPassword } from "@/lib/server/auth/passwords";
import { generateRandomRecoveryCode } from "@/lib/server/auth/utils";
import { DatabaseError } from "@/lib/server/errors";

export type User = Omit<
	DbUser,
	"passwordHash" | "recoveryCode" | "totpKey" | "createdAt" | "updatedAt"
> & {
	registered2FA: boolean;
};

export async function createUser(email: string, username: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = Buffer.from(encryptString(recoveryCode));

	const [row] = await db
		.insert(usersTable)
		.values({ email, username, passwordHash, recoveryCode: encryptedRecoveryCode })
		.returning({ id: usersTable.id, role: usersTable.role });

	if (row == null) {
		throw new DatabaseError();
	}

	const user: User = {
		id: row.id,
		username,
		email,
		role: row.role,
		emailVerified: false,
		registered2FA: false,
	};

	return user;
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: string,
	email: string,
): Promise<void> {
	await db.update(usersTable).set({ email, emailVerified: true }).where(eq(usersTable.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
	userId: string,
	email: string,
): Promise<boolean> {
	const rows = await db
		.update(usersTable)
		.set({ emailVerified: true })
		.where(and(eq(usersTable.id, userId), eq(usersTable.email, email)))
		.returning({ id: usersTable.id });

	return rows.length > 0;
}

export async function getUserPasswordHash(userId: string): Promise<string> {
	const [row] = await db
		.select({ passwordHash: usersTable.passwordHash })
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (row == null) {
		throw new InvalidUserIdError();
	}

	return row.passwordHash;
}

export async function getUserRecoverCode(userId: string): Promise<string> {
	const [row] = await db
		.select({ recoveryCode: usersTable.recoveryCode })
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (row == null) {
		throw new InvalidUserIdError();
	}

	return decryptToString(new Uint8Array(row.recoveryCode));
}

export async function getUserTOTPKey(userId: string): Promise<Uint8Array | null> {
	const [row] = await db
		.select({ totpKey: usersTable.totpKey })
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (row == null) {
		throw new InvalidUserIdError();
	}

	const encrypted = row.totpKey ? new Uint8Array(row.totpKey) : null;

	if (encrypted == null) {
		return null;
	}

	return decrypt(encrypted);
}

export async function updateUserTOTPKey(userId: string, key: Uint8Array): Promise<void> {
	const encrypted = Buffer.from(encrypt(key));
	await db.update(usersTable).set({ totpKey: encrypted }).where(eq(usersTable.id, userId));
}

export async function resetUserRecoveryCode(userId: string): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = Buffer.from(encryptString(recoveryCode));
	await db.update(usersTable).set({ recoveryCode: encrypted }).where(eq(usersTable.id, userId));

	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const [row] = await db
		.select({
			id: usersTable.id,
			email: usersTable.email,
			username: usersTable.username,
			role: usersTable.role,
			emailVerified: usersTable.emailVerified,
			totpKey: usersTable.totpKey,
		})
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (row == null) {
		return null;
	}

	const user: User = {
		id: row.id,
		role: row.role,
		email: row.email,
		username: row.username,
		emailVerified: row.emailVerified,
		registered2FA: row.totpKey != null,
	};

	return user;
}
