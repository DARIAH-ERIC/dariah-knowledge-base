// eslint-disable-next-line check-file/folder-naming-convention
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { TwoFactorResetFormContent } from "@/app/[locale]/auth/2fa/reset/_components/two-factor-reset-form-content";

export function TwoFactorResetForm(): ReactNode {
	const t = useTranslations("TwoFactorResetForm");

	return (
		<TwoFactorResetFormContent recoveryCodeLabel={t("recovery-code")} submitLabel={t("submit")} />
	);
}
