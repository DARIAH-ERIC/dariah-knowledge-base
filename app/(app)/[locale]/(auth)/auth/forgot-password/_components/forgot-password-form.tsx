import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ForgotPasswordFormContent } from "@/app/(app)/[locale]/(auth)/auth/forgot-password/_components/forgot-password-form-content";

export function ForgotPasswordForm(): ReactNode {
	const t = useTranslations("ForgotPasswordForm");

	return <ForgotPasswordFormContent emailLabel={t("email")} submitLabel={t("submit")} />;
}
