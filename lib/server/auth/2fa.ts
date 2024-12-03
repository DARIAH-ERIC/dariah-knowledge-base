// eslint-disable-next-line check-file/filename-naming-convention
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";
import { decryptToString, encryptString } from "@/lib/server/auth/encryption";
import { ExpiringTokenBucket } from "@/lib/server/auth/rate-limit";
import { generateRandomRecoveryCode } from "@/lib/server/auth/utils";

export const totpBucket = new ExpiringTokenBucket<string>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<string>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(
	userId: string,
	recoveryCode: string,
): Promise<boolean> {
	// TODO: wrap in transaction
	const [row] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

	if (row == null) {
		return false;
	}

	const encryptedRecoveryCode = new Uint8Array(row.recoveryCode);
	const userRecoveryCode = decryptToString(encryptedRecoveryCode);

	if (recoveryCode !== userRecoveryCode) {
		return false;
	}

	const newRecoveryCode = generateRandomRecoveryCode();
	const encryptedNewRecoveryCode = encryptString(newRecoveryCode);

	await db
		.update(sessionsTable)
		.set({ twoFactorVerified: false })
		.where(eq(sessionsTable.userId, userId));

	const result = await db
		.update(usersTable)
		.set({ recoveryCode: Buffer.from(encryptedNewRecoveryCode), totpKey: null })
		.where(
			and(
				eq(usersTable.id, userId),
				eq(usersTable.recoveryCode, Buffer.from(encryptedRecoveryCode)),
			),
		)
		.returning({ id: usersTable.id });

	return result.length > 0;
}
