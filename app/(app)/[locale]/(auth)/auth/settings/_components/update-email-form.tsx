import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { UpdateEmailFormContent } from "@/app/[locale]/auth/settings/_components/update-email-form-content";

export function UpdateEmailForm(): ReactNode {
	const t = useTranslations("UpdateEmailForm");

	return <UpdateEmailFormContent newEmailLabel={t("new-email")} submitLabel={t("submit")} />;
}
