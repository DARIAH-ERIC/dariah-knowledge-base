import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import reactAriaComponentsPlugin from "tailwindcss-react-aria-components";

const config = {
	content: ["./@(app|components|config|lib|styles)/**/*.@(css|js|ts|tsx)"],
	corePlugins: {
		container: false,
	},
	darkMode: [
		"variant",
		['&:where([data-ui-color-scheme="dark"], [data-ui-color-scheme="dark"] *)'],
	],
	plugins: [animatePlugin, reactAriaComponentsPlugin],
	theme: {
		extend: {
			borderRadius: {
				"0": "var(--corner-radius-0)",
				"0.5": "var(--corner-radius-2)",
				"1": "var(--corner-radius-4)",
				"2": "var(--corner-radius-8)",
				"3": "var(--corner-radius-12)",
				"4": "var(--corner-radius-16)",
				"5": "var(--corner-radius-20)",
				"6": "var(--corner-radius-24)",
				"8": "var(--corner-radius-32)",
				full: "var(--corner-radius-full)",
			},
			boxShadow: {
				overlay: "var(--shadow-overlay)",
				raised: "var(--shadow-raised)",
				sunken: "var(--shadow-sunken)",
			},
			colors: {
				current: "currentColor",
				transparent: "transparent",

				"background-alternate": "var(--color-background-alternate)",
				"background-base": "var(--color-background-base)",
				"background-brand": "var(--color-background-brand)",
				"background-inverse": "var(--color-background-inverse)",
				"background-overlay": "var(--color-background-overlay)",
				"background-raised": "var(--color-background-raised)",
				"background-sunken": "var(--color-background-sunken)",

				"fill-disabled": "var(--color-fill-disabled)",
				"fill-hover": "var(--color-fill-hover)",
				"fill-press": "var(--color-fill-press)",
				"fill-selected": "var(--color-fill-selected)",
				"fill-brand-strong": "var(--color-fill-brand-strong)",
				"fill-brand-weak": "var(--color-fill-brand-weak)",
				"fill-error-strong": "var(--color-fill-error-strong)",
				"fill-error-weak": "var(--color-fill-error-weak)",
				"fill-information-strong": "var(--color-fill-information-strong)",
				"fill-information-weak": "var(--color-fill-information-weak)",
				"fill-inverse-disabled": "var(--color-fill-inverse-disabled)",
				"fill-inverse-hover": "var(--color-fill-inverse-hover)",
				"fill-inverse-press": "var(--color-fill-inverse-press)",
				"fill-inverse-strong": "var(--color-fill-inverse-strong)",
				"fill-inverse-weak": "var(--color-fill-inverse-weak)",
				"fill-overlay": "var(--color-fill-overlay)",
				"fill-strong": "var(--color-fill-strong)",
				"fill-success-strong": "var(--color-fill-success-strong)",
				"fill-success-weak": "var(--color-fill-success-weak)",
				"fill-warning-strong": "var(--color-fill-warning-strong)",
				"fill-warning-weak": "var(--color-fill-warning-weak)",
				"fill-weak": "var(--color-fill-weak)",
				"fill-weaker": "var(--color-fill-weaker)",
				"fill-white": "var(--color-fill-white)",
				"fill-yellow": "var(--color-fill-yellow)",

				"icon-brand": "var(--color-icon-brand)",
				"icon-disabled": "var(--color-icon-disabled)",
				"icon-error": "var(--color-icon-error)",
				"icon-information": "var(--color-icon-information)",
				"icon-inverse": "var(--color-icon-inverse)",
				"icon-inverse-disabled": "var(--color-icon-inverse-disabled)",
				"icon-inverse-strong": "var(--color-icon-inverse-strong)",
				"icon-neutral": "var(--color-icon-neutral)",
				"icon-success": "var(--color-icon-success)",
				"icon-warning": "var(--color-icon-warning)",

				"stroke-brand-strong": "var(--color-stroke-brand-strong)",
				"stroke-brand-weak": "var(--color-stroke-brand-weak)",
				"stroke-disabled": "var(--color-stroke-disabled)",
				"stroke-error-strong": "var(--color-stroke-error-strong)",
				"stroke-error-weak": "var(--color-stroke-error-weak)",
				"stroke-focus": "var(--color-stroke-focus)",
				"stroke-information-strong": "var(--color-stroke-information-strong)",
				"stroke-information-weak": "var(--color-stroke-information-weak)",
				"stroke-inverse-disabled": "var(--color-stroke-inverse-disabled)",
				"stroke-inverse-strong": "var(--color-stroke-inverse-strong)",
				"stroke-inverse-weak": "var(--color-stroke-inverse-weak)",
				"stroke-selected": "var(--color-stroke-selected)",
				"stroke-strong": "var(--color-stroke-strong)",
				"stroke-success-strong": "var(--color-stroke-success-strong)",
				"stroke-success-weak": "var(--color-stroke-success-weak)",
				"stroke-warning-strong": "var(--color-stroke-warning-strong)",
				"stroke-warning-weak": "var(--color-stroke-warning-weak)",
				"stroke-weak": "var(--color-stroke-weak)",

				"text-brand": "var(--color-text-brand)",
				"text-disabled": "var(--color-text-disabled)",
				"text-error": "var(--color-text-error)",
				"text-information": "var(--color-text-information)",
				"text-inverse-disabled": "var(--color-text-inverse-disabled)",
				"text-inverse-strong": "var(--color-text-inverse-strong)",
				"text-inverse-weak": "var(--color-text-inverse-weak)",
				"text-strong": "var(--color-text-strong)",
				"text-success": "var(--color-text-success)",
				"text-warning": "var(--color-text-warning)",
				"text-weak": "var(--color-text-weak)",
			},
			fontFamily: {
				body: "var(--font-family-body)",
				heading: "var(--font-family-heading)",
				mono: "var(--font-family-mono)",
			},
			fontSize: {
				display: [
					"var(--font-size-display)",
					{ letterSpacing: "-1px", lineHeight: "var(--line-height-display)" },
				],
				"heading-1": [
					"var(--font-size-heading-1)",
					{ letterSpacing: "-0.5px", lineHeight: "var(--line-height-heading-1)" },
				],
				"heading-2": ["var(--font-size-heading-2)", { lineHeight: "var(--line-height-heading-2)" }],
				"heading-3": ["var(--font-size-heading-3)", { lineHeight: "var(--line-height-heading-3)" }],
				"heading-4": ["var(--font-size-heading-4)", { lineHeight: "var(--line-height-heading-4)" }],
				small: ["var(--font-size-small)", { lineHeight: "var(--line-height-small)" }],
				tiny: ["var(--font-size-tiny)", { lineHeight: "var(--line-height-tiny)" }],
				uppercase: ["var(--font-size-uppercase)", { lineHeight: "var(--line-height-uppercase)" }],
			},
			fontWeight: {
				strong: "var(--font-weight-strong)",
				weak: "var(--font-weight-weak)",
			},
			screens: {
				xs: "30rem",
				sm: "40rem",
				md: "48rem",
				lg: "64rem",
				xl: "80rem",
				"2xl": "96rem",
				"3xl": "120rem",
			},
			spacing: {
				"0": "var(--spacing-0)",
				"0.5": "var(--spacing-2)",
				"1": "var(--spacing-4)",
				"1.5": "var(--spacing-6)",
				"2": "var(--spacing-8)",
				"2.5": "var(--spacing-10)",
				"3": "var(--spacing-12)",
				"3.5": "var(--spacing-14)",
				"4": "var(--spacing-16)",
				"5": "var(--spacing-20)",
				"6": "var(--spacing-24)",
				"8": "var(--spacing-32)",
				"10": "var(--spacing-40)",
				"12": "var(--spacing-48)",
				"14": "var(--spacing-56)",
				"16": "var(--spacing-64)",
				"20": "var(--spacing-80)",
				"24": "var(--spacing-96)",
				"32": "var(--spacing-128)",
				"48": "var(--spacing-192)",
				"64": "var(--spacing-256)",
			},
		},
	},
} satisfies Config;

export default config;
