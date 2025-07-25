// eslint-disable-next-line no-restricted-imports
import { redirect } from "next/navigation";

import { defaultLocale } from "@/lib/i18n/locales";

/**
 * This page only renders when the app is built statically with `output: "export"`.
 */
export default function RootPage(): void {
	redirect(`/${defaultLocale}`);
}
