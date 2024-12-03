import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { urls } from "@/config/auth.config";
import { env } from "@/config/env.config";

export function AuthButtonGroup(): ReactNode {
	const t = useTranslations("AuthButtonGroup");

	return (
		<div className="flex items-center gap-x-2">
			<Link
				className={cn(
					"inline-flex min-h-8 items-center rounded-2 border border-stroke-brand-strong px-3 py-1 text-tiny font-strong text-text-brand shadow-raised",
					"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
				)}
				href={urls.signIn}
			>
				{t("sign-in")}
			</Link>
			{env.AUTH_SIGN_UP === "enabled" ? (
				<Link
					className={cn(
						"inline-flex min-h-8 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-3 py-1 text-tiny font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
					href={urls.signUp}
				>
					{t("sign-up")}
				</Link>
			) : null}
		</div>
	);
}
