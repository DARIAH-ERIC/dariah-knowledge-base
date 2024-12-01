import type { ReactNode } from "react";

export { Video as VideoPreview } from "@/components/content/video";

interface FigurePreviewProps {
	alt?: string;
	children: ReactNode;
	src: string;
}

/**
 * Cannot use `Figure` directly as cms preview, because react server components are not supported.
 */
export function FigurePreview(props: FigurePreviewProps): ReactNode {
	const { alt = "", children, src } = props;

	return (
		<figure>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img alt={alt} src={src} />
			<figcaption>{children}</figcaption>
		</figure>
	);
}
