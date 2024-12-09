import { styles } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import type { CalloutKind } from "@/lib/keystatic/component-options";

const calloutStyles = styles({
	base: "my-4 rounded-1 p-4 text-tiny leading-relaxed",
	variants: {
		kind: {
			caution: "",
			important: "",
			note: "",
			tip: "",
			warning: "",
		},
	},
	defaults: {
		kind: "note",
	},
});

interface CalloutProps {
	children: ReactNode;
	/** @default "note" */
	kind?: CalloutKind;
	title?: string;
}

export function Callout(props: Readonly<CalloutProps>): ReactNode {
	const { children, kind = "note", title } = props;

	return (
		<aside className={calloutStyles({ kind })}>
			{title ? <strong>{title}</strong> : null}
			{children}
		</aside>
	);
}
