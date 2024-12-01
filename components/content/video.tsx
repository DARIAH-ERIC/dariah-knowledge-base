import { createUrl, createUrlSearchParams } from "@acdh-oeaw/lib";
import type { ReactNode } from "react";

interface VideoProps {
	children: ReactNode;
	id: string;
	provider: "youtube";
	startTime?: number | null;
	/** Added by `with-iframe-titles` mdx plugin. */
	title?: string;
}

export function Video(props: Readonly<VideoProps>): ReactNode {
	const { children, id, provider, startTime, title } = props;

	const src = String(createVideoUrl(provider, id, startTime));

	return (
		<figure>
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen={true}
				className="aspect-video"
				referrerPolicy="strict-origin-when-cross-origin"
				src={src}
				title={title}
			/>
			<figcaption>{children}</figcaption>
		</figure>
	);
}

function createVideoUrl(
	provider: VideoProps["provider"],
	id: VideoProps["id"],
	startTime: VideoProps["startTime"],
): URL {
	switch (provider) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		case "youtube": {
			return createUrl({
				baseUrl: "https://www.youtube-nocookie.com",
				pathname: `/embed/${id}`,
				searchParams: startTime != null ? createUrlSearchParams({ start: startTime }) : undefined,
			});
		}
	}
}
