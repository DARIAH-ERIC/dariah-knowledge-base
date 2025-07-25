import { expect, test } from "@/e2e/lib/test";
import { locales } from "@/lib/i18n/locales";

test.describe("imprint page", () => {
	test("should have document title", async ({ createImprintPage }) => {
		for (const locale of locales) {
			const { i18n, imprintPage } = await createImprintPage(locale);
			await imprintPage.goto();

			await expect(imprintPage.page).toHaveTitle(
				[i18n.t("ImprintPage.meta.title"), i18n.messages.metadata.title].join(" | "),
			);
		}
	});

	test("should have imprint text", async ({ createImprintPage }) => {
		const imprints = {
			"en-GB": "Legal disclosure",
		};

		for (const locale of locales) {
			const { imprintPage } = await createImprintPage(locale);
			await imprintPage.goto();

			await expect(imprintPage.page.getByRole("main")).toContainText(imprints[locale]);
		}
	});

	test("should not have any automatically detectable accessibility issues", async ({
		createAccessibilityScanner,
		createImprintPage,
		browserName,
	}) => {
		/**
		 * FIXME: This test is flaky in webkit, but seems to always pass
		 * when setting `--trace on`.
		 */
		// eslint-disable-next-line playwright/no-skipped-test
		test.skip(browserName === "webkit");

		for (const locale of locales) {
			const { imprintPage } = await createImprintPage(locale);
			await imprintPage.goto();

			const { getViolations } = await createAccessibilityScanner();
			expect(await getViolations()).toEqual([]);
		}
	});

	test("should not have visible changes", async ({ createImprintPage }) => {
		for (const locale of locales) {
			const { imprintPage } = await createImprintPage(locale);
			await imprintPage.goto();

			await expect(imprintPage.page).toHaveScreenshot();
		}
	});
});
