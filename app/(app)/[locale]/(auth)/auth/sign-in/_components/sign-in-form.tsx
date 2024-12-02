import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { SignInFormContent } from "@/app/[locale]/auth/sign-in/_components/sign-in-form-content";

export function SignInForm(): ReactNode {
	const t = useTranslations("SignInForm");

	return (
		<SignInFormContent
			emailLabel={t("email")}
			passwordLabel={t("password")}
			submitLabel={t("submit")}
		/>
	);
}
