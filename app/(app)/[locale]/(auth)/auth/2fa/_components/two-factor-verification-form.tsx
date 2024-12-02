// eslint-disable-next-line check-file/folder-naming-convention
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { TwoFactorVerificationFormContent } from "@/app/[locale]/auth/2fa/_components/two-factor-verification-form-content";

export function TwoFactorVerificationForm(): ReactNode {
	const t = useTranslations("TwoFactorVerificationForm");

	return <TwoFactorVerificationFormContent codeLabel={t("code")} submitLabel={t("submit")} />;
}
