export async function register() {
	// eslint-disable-next-line no-restricted-syntax
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// eslint-disable-next-line no-restricted-syntax
		if (process.env.DB_MIGRATIONS !== "disabled") {
			await import("@/db/migrate");
		}
	}
}
