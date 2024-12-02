export async function register() {
	// eslint-disable-next-line no-restricted-syntax
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./db/migrate.js");
	}
}
