import { useTranslations } from "next-intl";
import { type ReactNode, useMemo } from "react";

import { ColorSchemeSelect } from "@/components/color-scheme-select";
import type { ColorScheme } from "@/lib/color-scheme-script";

export function ColorSchemeSwitcher(): ReactNode {
	const t = useTranslations("ColorSchemeSwitcher");

	const items = useMemo(() => {
		return Object.fromEntries(
			(["system", "light", "dark"] as const).map((colorScheme) => {
				return [colorScheme, t(`color-schemes.${colorScheme}`)];
			}),
		) as Record<ColorScheme | "system", string>;
	}, [t]);

	return <ColorSchemeSelect items={items} label={t("change-color-scheme")} />;
}
