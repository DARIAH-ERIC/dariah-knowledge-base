import type { AriaLabelingProps, DOMProps } from "@react-types/shared";
import { Loader2Icon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/styles";
import { useLabels } from "@/lib/use-labels";

interface LoadingIndicatorProps
	extends AriaLabelingProps,
		DOMProps,
		Pick<ComponentPropsWithoutRef<"svg">, "aria-hidden" | "className"> {}

export function LoadingIndicator(props: LoadingIndicatorProps): ReactNode {
	const { "aria-hidden": ariaHidden, className, ...rest } = props;

	const labelingProps = useLabels(rest);
	const hasLabeling =
		labelingProps["aria-label"] != null || labelingProps["aria-labelledby"] != null;

	return (
		<Loader2Icon
			{...labelingProps}
			aria-hidden={hasLabeling ? (ariaHidden ?? undefined) : true}
			className={cn("animate-spin", className)}
		/>
	);
}
