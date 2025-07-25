import { log } from "@acdh-oeaw/lib";
import createI18nPlugin from "next-intl/plugin";

/**
 * Generate i18n message types so they are available when running lint and typecheck *before*
 * the next.js cli has been invoked.
 *
 * This script should be run as a `postinstall` or `prepare` npm lifecycle script.
 *
 * @see https://github.com/amannn/next-intl/discussions/1737
 */
createI18nPlugin({
	experimental: {
		/** @see https://next-intl.dev/docs/workflows/typescript#messages-arguments */
		createMessagesDeclaration: ["./content/en/metadata/index.json", "./messages/en.json"],
	},
})();

log.success("Successfully generated i18n message types.");
