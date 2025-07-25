import { Fragment } from "react";

interface RequiredIndicatorProps {
	isVisible: boolean | undefined;
}

export function RequiredIndicator(props: RequiredIndicatorProps) {
	const { isVisible } = props;

	if (!isVisible) return null;

	return (
		<Fragment>
			<span
				aria-hidden={true}
				className="inline-flex translate-x-0.5 -translate-y-px text-negative-500"
			>
				*
			</span>
			<span className="sr-only"> (required)</span>
		</Fragment>
	);
}
