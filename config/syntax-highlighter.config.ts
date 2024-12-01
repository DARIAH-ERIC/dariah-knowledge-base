import type { BuiltinTheme, CodeOptionsThemes } from "shiki";

export const config: CodeOptionsThemes<BuiltinTheme> = {
	defaultColor: "light",
	themes: {
		light: "github-light",
		dark: "github-dark",
	},
};
