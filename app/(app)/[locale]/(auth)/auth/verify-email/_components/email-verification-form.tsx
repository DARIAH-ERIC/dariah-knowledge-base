import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { EmailVerificationFormContent } from "@/app/[locale]/auth/verify-email/_components/email-verification-form-content";

export function EmailVerificationForm(): ReactNode {
	const t = useTranslations("EmailVerificationForm");

	return <EmailVerificationFormContent codeLabel={t("code")} verifyLabel={t("verify")} />;
}
