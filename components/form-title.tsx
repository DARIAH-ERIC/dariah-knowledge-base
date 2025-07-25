import type { ReactNode } from "react";

interface FormTitleProps {
	children: ReactNode;
}

export function FormTitle(props: FormTitleProps): ReactNode {
	const { children } = props;

	return (
		<h2 className="text-md leading-tight font-semibold tracking-tighter text-balance text-neutral-950 sm:text-lg md:text-xl dark:text-neutral-0">
			{children}
		</h2>
	);
}
