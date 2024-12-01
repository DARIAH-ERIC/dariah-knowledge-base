import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ContactFormContent } from "@/app/(app)/[locale]/(content)/contact/_components/contact-form-content";

export function ContactForm(): ReactNode {
	const t = useTranslations("ContactForm");

	return (
		<ContactFormContent
			emailLabel={t("email")}
			messageLabel={t("message")}
			subjectLabel={t("subject")}
			submitLabel={t("submit")}
		/>
	);
}
