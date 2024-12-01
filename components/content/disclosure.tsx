import type { ReactNode } from "react";

interface DisclosureProps {
	children: ReactNode;
	title: string;
}

export function Disclosure(props: Readonly<DisclosureProps>): ReactNode {
	const { children, title } = props;

	return (
		<details>
			<summary>{title}</summary>
			{children}
		</details>
	);
}
