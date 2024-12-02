// eslint-disable-next-line check-file/folder-naming-convention
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { TwoFactorSetUpFormContent } from "@/app/[locale]/auth/2fa/setup/_components/two-factor-set-up-form-content";

interface TwoFactorSetUpFormProps {
	encodedTOTPKey: string;
}

export function TwoFactorSetUpForm(props: TwoFactorSetUpFormProps): ReactNode {
	const { encodedTOTPKey } = props;

	const t = useTranslations("TwoFactorSetUpForm");

	return (
		<TwoFactorSetUpFormContent
			encodedTOTPKey={encodedTOTPKey}
			submitLabel={t("submit")}
			verifyLabel={t("verify")}
		/>
	);
}
