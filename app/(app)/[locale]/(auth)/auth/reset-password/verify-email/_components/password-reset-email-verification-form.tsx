import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { PasswordResetEmailVerificationFormContent } from "@/app/[locale]/auth/reset-password/verify-email/_components/password-reset-email-verification-form-content";

export function PasswordResetEmailVerificationForm(): ReactNode {
	const t = useTranslations("PasswordResetEmailVerificationForm");

	return (
		<PasswordResetEmailVerificationFormContent codeLabel={t("code")} submitLabel={t("submit")} />
	);
}
