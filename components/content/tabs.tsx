import type { ReactNode } from "react";

interface TabsProps {
	children: ReactNode;
}

export function Tabs(props: Readonly<TabsProps>): ReactNode {
	const { children } = props;

	return <div>{children}</div>;
}

interface TabProps {
	children: ReactNode;
	title: string;
}

export function Tab(props: Readonly<TabProps>): ReactNode {
	const { children, title } = props;

	return <div>{children}</div>;
}
