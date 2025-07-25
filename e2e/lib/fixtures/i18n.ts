import type { Page } from "@playwright/test";
import { createFormatter, createTranslator } from "next-intl";

import type metadata from "@/content/en/metadata/index.json";
import { defaultLocale, getIntlLanguage, type IntlLocale } from "@/lib/i18n/locales";
import type { IntlMessages } from "@/lib/i18n/messages";
import type messages from "@/messages/en.json";

export interface I18n {
	t: ReturnType<typeof createTranslator<IntlMessages>>;
	format: ReturnType<typeof createFormatter>;
	messages: IntlMessages;
}

export async function createI18n(_page: Page, locale = defaultLocale): Promise<I18n> {
	const messages = await getIntlMessages(locale);

	return {
		t: createTranslator({ locale, messages }),
		format: createFormatter({ locale }),
		messages,
	};
}

export type WithI18n<T> = T & { i18n: I18n };

/**
 * Copied from `@/lib/i18n/get-messages.ts` because playwright needs import attributes
 * for json imports.
 */

type Messages = typeof messages;
type Metadata = typeof metadata;
type SocialMediaKind = Metadata["social"][number]["kind"];

async function getIntlMessages(locale: IntlLocale) {
	const language = getIntlLanguage(locale);

	const { default: _messages } = (await import(`@/messages/${language}.json`, {
		with: { type: "json" },
	})) as { default: Messages };
	const { default: _metadata } = (await import(`@/content/${language}/metadata/index.json`, {
		with: { type: "json" },
	})) as { default: Metadata };

	const _social: Record<string, string> = {};

	_metadata.social.forEach((entry) => {
		_social[entry.kind] = entry.href;
	});

	const messages = {
		..._messages,
		metadata: {
			..._metadata,
			social: _social as Record<SocialMediaKind, string>,
		},
	};

	return messages;
}
