import type { ReactNode } from "react";

import { cn } from "@/lib/styles";

export const id = "main-content";

interface MainContentProps {
	children: ReactNode;
	className?: string;
}

export function MainContent(props: MainContentProps): ReactNode {
	const { children, className } = props;

	return (
		<main className={cn("max-w-(--breakpoint-lg) outline-0", className)} id={id} tabIndex={-1}>
			{children}
		</main>
	);
}
