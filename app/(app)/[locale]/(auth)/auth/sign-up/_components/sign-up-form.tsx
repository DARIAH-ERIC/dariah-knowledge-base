import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { SignUpFormContent } from "@/app/[locale]/auth/sign-up/_components/sign-up-form-content";

export function SignUpForm(): ReactNode {
	const t = useTranslations("SignUpForm");

	return (
		<SignUpFormContent
			confirmPasswordLabel={t("confirm-password")}
			emailLabel={t("email")}
			passwordLabel={t("password")}
			submitLabel={t("submit")}
			usernameLabel={t("username")}
		/>
	);
}
