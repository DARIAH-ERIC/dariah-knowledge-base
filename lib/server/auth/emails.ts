import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const [row] = await db
		.select({ count: count() })
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (row == null) {
		throw new Error();
	}

	return row.count === 0;
}
