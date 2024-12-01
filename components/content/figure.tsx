import type { ReactNode } from "react";

import { Image } from "@/components/image";

interface FigureProps {
	alt?: string;
	children: ReactNode;
	/** Maybe added by `with-image-sizes` mdx plugin. */
	height?: number;
	src: string;
	/** Maybe added by `with-image-sizes` mdx plugin. */
	width?: number;
}

export function Figure(props: Readonly<FigureProps>): ReactNode {
	const { alt = "", children, height, src, width } = props;

	return (
		<figure>
			{/* @ts-expect-error @see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/69970 */}
			<Image alt={alt} height={height} src={src} width={width} />
			<figcaption>{children}</figcaption>
		</figure>
	);
}
