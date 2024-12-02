// eslint-disable-next-line check-file/folder-naming-convention
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { PasswordResetTOTPFormContent } from "@/app/[locale]/auth/reset-password/2fa/_components/password-reset-totp-form-content";

export function PasswordResetTOTPForm(): ReactNode {
	const t = useTranslations("PasswordResetTOTPForm");

	return <PasswordResetTOTPFormContent codeLabel={t("code")} submitLabel={t("submit")} />;
}
