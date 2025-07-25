import type { ReactNode } from "react";

interface PageTitleProps {
	children: ReactNode;
}

export function PageTitle(props: PageTitleProps): ReactNode {
	const { children } = props;

	return (
		<h1 className="text-3xl leading-[1.125] font-bold tracking-tighter text-balance text-neutral-950 md:text-4xl lg:text-5xl dark:text-neutral-0">
			{children}
		</h1>
	);
}
