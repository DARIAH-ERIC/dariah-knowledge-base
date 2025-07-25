"use client";

import { useLocale } from "next-intl";
import type { Key, ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";
import {
	Select,
	SelectListBox,
	SelectListBoxItem,
	SelectPopover,
	SelectValue,
} from "@/components/ui/select";
import { getIntlLanguage, type IntlLocale } from "@/lib/i18n/locales";
import { createHref } from "@/lib/navigation/create-href";
import { usePathname, useRouter } from "@/lib/navigation/navigation";

interface LocaleSelectProps {
	items: Record<IntlLocale, string>;
	label: string;
}

export function LocaleSelect(props: LocaleSelectProps): ReactNode {
	const { items, label } = props;

	const currentLocale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	function onSelectionChange(key: Key | null) {
		const locale = key as IntlLocale;
		router.push(createHref({ pathname }), { locale });
	}

	return (
		<Select
			aria-label={label}
			name="locale"
			onSelectionChange={onSelectionChange}
			selectedKey={currentLocale}
		>
			<IconButton variant="plain">
				<span aria-hidden={true}>{getIntlLanguage(currentLocale).toUpperCase()}</span>
				<SelectValue className="sr-only" />
			</IconButton>
			<SelectPopover placement="bottom">
				<SelectListBox>
					{Object.entries(items).map(([id, label]) => {
						return (
							<SelectListBoxItem key={id} id={id} textValue={label}>
								{label}
							</SelectListBoxItem>
						);
					})}
				</SelectListBox>
			</SelectPopover>
		</Select>
	);
}
