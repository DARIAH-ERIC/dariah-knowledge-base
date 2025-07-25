"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

export const ColorSchemeSelect = dynamic(
	() => {
		return import("@/components/color-scheme-select.client").then((module) => {
			return { default: module.ColorSchemeSelect };
		});
	},
	{
		loading: ColorSchemeSelectLoadingIndicator,
		ssr: false,
	},
);

function ColorSchemeSelectLoadingIndicator(): ReactNode {
	return <div className="size-9" />;
}
