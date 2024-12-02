import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ResendEmailVerificationCodeFormContent } from "@/app/[locale]/auth/verify-email/_components/resend-email-verification-code-form-content";

export function ResendEmailVerificationCodeForm(): ReactNode {
	const t = useTranslations("ResendEmailVerificationCodeForm");

	return <ResendEmailVerificationCodeFormContent resendCodeLabel={t("resend-code")} />;
}
