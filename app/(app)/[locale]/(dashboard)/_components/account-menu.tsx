import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { AccountMenuContent } from "@/app/(app)/[locale]/(dashboard)/_components/account-menu-content";
import type { User } from "@/lib/server/auth/users";

interface AccountMenuProps {
	user: User;
}

export function AccountMenu(props: AccountMenuProps): ReactNode {
	const { user } = props;

	const t = useTranslations("AccountMenu");

	return (
		<AccountMenuContent settingsLabel={t("settings")} signOutLabel={t("sign-out")} user={user} />
	);
}
