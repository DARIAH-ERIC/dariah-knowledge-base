import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { UpdatePasswordFormContent } from "@/app/[locale]/auth/settings/_components/update-password-form-content";

export function UpdatePasswordForm(): ReactNode {
	const t = useTranslations("UpdatePasswordForm");

	return (
		<UpdatePasswordFormContent
			confirmNewPasswordLabel={t("confirm-new-password")}
			currentPasswordLabel={t("current-password")}
			newPasswordLabel={t("new-password")}
			submitLabel={t("submit")}
		/>
	);
}
