import createBundleAnalyzer from "@next/bundle-analyzer";
import localesPlugin from "@react-aria/optimize-locales-plugin";
import type { NextConfig } from "next";
import createI18nPlugin from "next-intl/plugin";

import { env } from "@/config/env.config";

const config: NextConfig = {
	/** Compression should be handled by nginx reverse proxy. */
	compress: false,
	eslint: {
		dirs: [process.cwd()],
		ignoreDuringBuilds: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	output: env.BUILD_MODE,
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

const plugins: Array<(config: NextConfig) => NextConfig> = [
	createBundleAnalyzer({ enabled: env.BUNDLE_ANALYZER === "enabled" }),
	createI18nPlugin("./lib/i18n/get-request-config.ts"),
];

export default plugins.reduce((config, plugin) => {
	return plugin(config);
}, config);
