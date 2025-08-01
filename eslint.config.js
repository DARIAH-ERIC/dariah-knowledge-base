/** @typedef {import("typescript-eslint").Config} Config */

import { resolve } from "node:path";

import baseConfig from "@acdh-oeaw/eslint-config";
import nextConfig from "@acdh-oeaw/eslint-config-next";
import playwrightConfig from "@acdh-oeaw/eslint-config-playwright";
import reactConfig from "@acdh-oeaw/eslint-config-react";
import tailwindcssConfig from "@acdh-oeaw/eslint-config-tailwindcss";
import gitignore from "eslint-config-flat-gitignore";
import checkFilePlugin from "eslint-plugin-check-file";

/** @type {Config} */
const config = [
	gitignore({ strict: false }),
	...baseConfig,
	...reactConfig,
	...nextConfig,
	...tailwindcssConfig,
	{
		settings: {
			tailwindcss: {
				config: resolve("./styles/index.css"),
			},
		},
	},
	...playwrightConfig,
	{
		plugins: {
			"check-file": checkFilePlugin,
		},
		rules: {
			"check-file/filename-naming-convention": [
				"error",
				{
					"**/*": "KEBAB_CASE",
				},
				{ ignoreMiddleExtensions: true },
			],
			"check-file/folder-naming-convention": [
				"error",
				{
					"**/": "NEXT_JS_APP_ROUTER_CASE",
				},
			],
		},
	},
	{
		rules: {
			"arrow-body-style": ["error", "always"],
			"no-restricted-imports": [
				"error",
				{
					name: "next/image",
					message: "Please use `@/components/image` instead.",
				},
				{
					name: "next/link",
					message: "Please use `@/components/link` instead.",
				},
				{
					name: "next/navigation",
					importNames: ["redirect", "permanentRedirect", "useRouter", "usePathname"],
					message: "Please use `@/lib/navigation/navigation` instead.",
				},
				{
					name: "next/router",
					message: "Please use `@/lib/navigation/navigation` instead.",
				},
			],
			"no-restricted-syntax": [
				"error",
				{
					selector: 'MemberExpression[computed!=true][object.name="process"][property.name="env"]',
					message: "Please use `@/config/env.config` instead.",
				},
			],
			// "@typescript-eslint/explicit-module-boundary-types": "error",
			"@typescript-eslint/require-array-sort-compare": "error",
			// "@typescript-eslint/strict-boolean-expressions": "error",
			"@typescript-eslint/switch-exhaustiveness-check": [
				"error",
				{ considerDefaultExhaustiveForUnions: true },
			],
			"react/jsx-sort-props": ["error", { reservedFirst: true }],
		},
	},
];

export default config;
