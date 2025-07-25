/** @typedef {import('next').NextConfig} NextConfig */

import createBundleAnalyzerPlugin from "@next/bundle-analyzer";
import createMdxPlugin from "@next/mdx";
import localesPlugin from "@react-aria/optimize-locales-plugin";
import { withSentryConfig } from "@sentry/nextjs";
import createI18nPlugin from "next-intl/plugin";

import { env } from "./config/env.config.js";
import { config as mdxConfig } from "./config/mdx.config.js";

/** @type {NextConfig} */
const config = {
	eslint: {
		dirs: [process.cwd()],
		ignoreDuringBuilds: true,
	},
	experimental: {
		taint: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	output: env.BUILD_MODE,
	pageExtensions: ["ts", "tsx", "md", "mdx"],
	redirects() {
		/** @type {Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>} */
		const redirects = [
			{
				source: "/admin",
				destination: "/keystatic",
				permanent: false,
			},
		];

		return Promise.resolve(redirects);
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	webpack(config, { isServer }) {
		/**
		 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#nextjs-app-router
		 */
		if (!isServer) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			config.plugins.push(localesPlugin.webpack({ locales: [] }));
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return config;
	},
};

/** @type {Array<(config: NextConfig) => NextConfig>} */
const plugins = [
	createBundleAnalyzerPlugin({ enabled: env.BUNDLE_ANALYZER === "enabled" }),
	createI18nPlugin({
		experimental: {
			/** @see https://next-intl.dev/docs/workflows/typescript#messages-arguments */
			createMessagesDeclaration: ["./content/en/metadata/index.json", "./messages/en.json"],
		},
		requestConfig: "./lib/i18n/request.ts",
	}),
	createMdxPlugin({
		extension: /\.(md|mdx)$/,
		options: mdxConfig,
	}),
	function createSentryPlugin(config) {
		return withSentryConfig(config, {
			disableLogger: true,
			org: env.NEXT_PUBLIC_SENTRY_ORG,
			project: env.NEXT_PUBLIC_SENTRY_PROJECT,
			reactComponentAnnotation: {
				enabled: true,
			},
			silent: env.CI !== true,
			/**
			 * Uncomment to route browser requests to sentry through a next.js rewrite to circumvent
			 * ad-blockers.
			 */
			// tunnelRoute: true,
			widenClientFileUpload: true,
		});
	},
];

export default plugins.reduce((config, plugin) => {
	return plugin(config);
}, config);
