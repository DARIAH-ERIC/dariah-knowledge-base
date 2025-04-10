import { defineConfig, devices } from "@playwright/test";
import { isCI } from "ci-info";

const port = 3000;
const baseUrl = `http://localhost:${String(port)}`;

export default defineConfig({
	testDir: "./e2e",
	snapshotDir: "./e2e/snapshots",
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	maxFailures: 10,
	workers: isCI ? 1 : undefined,
	reporter: isCI ? "github" : "html",
	use: {
		baseURL: baseUrl,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "setup",
			testMatch: "global.setup.ts",
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			dependencies: ["setup"],
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
			dependencies: ["setup"],
		},
		/** Test against mobile viewports. */
		// {
		// 	name: "Mobile Chrome",
		// 	use: { ...devices["Pixel 5"] },
		// 	dependencies: ["setup"],
		// },
		// {
		// 	name: "Mobile Safari",
		// 	use: { ...devices["iPhone 12"] },
		// 	dependencies: ["setup"],
		// },
		/** Test against branded browsers. */
		// {
		// 	name: "Microsoft Edge",
		// 	use: { ...devices["Desktop Edge"], channel: "msedge" },
		// 	dependencies: ["setup"],
		// },
		// {
		// 	name: "Google Chrome",
		// 	use: { ...devices["Desktop Chrome"], channel: "chrome" },
		// 	dependencies: ["setup"],
		// },
	],
	webServer: [
		{
			command: "pnpm run start",
			url: baseUrl,
			reuseExistingServer: !isCI,
		},
	],
});
