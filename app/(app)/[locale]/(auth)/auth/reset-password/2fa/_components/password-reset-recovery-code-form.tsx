// eslint-disable-next-line check-file/folder-naming-convention
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { PasswordResetRecoveryCodeFormContent } from "@/app/[locale]/auth/reset-password/2fa/_components/password-reset-recovery-code-form-content";

export function PasswordResetRecoveryCodeForm(): ReactNode {
	const t = useTranslations("PasswordResetRecoveryCodeForm");

	return (
		<PasswordResetRecoveryCodeFormContent
			recoveryCodeLabel={t("recovery-code")}
			submitLabel={t("submit")}
		/>
	);
}
