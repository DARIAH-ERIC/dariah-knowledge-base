import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { RecoveryCodeFormContent } from "@/app/[locale]/auth/settings/_components/recovery-code-form-content";

interface RecoveryCodeFormProps {
	recoveryCode: string;
}

export function RecoveryCodeForm(props: RecoveryCodeFormProps): ReactNode {
	const { recoveryCode } = props;

	const t = useTranslations("RecoveryCodeForm");

	return (
		<RecoveryCodeFormContent
			generateNewCodeLabel={t("generate-new-code")}
			recoveryCode={recoveryCode}
			yourCodeLabel={t("your-code")}
		/>
	);
}
