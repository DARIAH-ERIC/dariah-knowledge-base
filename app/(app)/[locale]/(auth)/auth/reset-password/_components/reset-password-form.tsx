import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ResetPasswordFormContent } from "@/app/[locale]/auth/reset-password/_components/reset-password-form-content";

export function ResetPasswordForm(): ReactNode {
	const t = useTranslations("ResetPasswordForm");

	return (
		<ResetPasswordFormContent
			confirmPasswordLabel={t("confirm-password")}
			passwordLabel={t("password")}
			submitLabel={t("submit")}
		/>
	);
}
