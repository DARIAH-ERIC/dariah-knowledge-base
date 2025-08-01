import { ImageResponse } from "next/og";

import type { IntlLocale } from "@/lib/i18n/locales";

interface MetadataImageProps {
	locale: IntlLocale;
	size: { width: number; height: number };
	title: string;
}

export async function MetadataImage(props: MetadataImageProps): Promise<ImageResponse> {
	const { locale, size, title } = props;

	/**
	 * FIXME: Variable fonts are currently not supported by `satori`.
	 *
	 * @see https://github.com/vercel/satori/issues/162
	 */
	const inter = await fetch(new URL("../assets/fonts/inter-semibold.ttf", import.meta.url)).then(
		(res) => {
			return res.arrayBuffer();
		},
	);

	return new ImageResponse(
		(
			<div
				lang={locale}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 32,
					justifyContent: "center",
					alignItems: "center",
					width: "100%",
					height: "100%",
					padding: 16,
					backgroundColor: "#fff",
				}}
			>
				<svg fill="#069" viewBox="0 0 142 142" width={200}>
					<path d="M49.33 24.729c0-10.093 12.994-16.333 21.548-21.516 6.721 4.093 22.397 11.499 22.4 22.119.004 11.79-4.904 31.006-8.806 31.09-4.246.093-10.11-24.356-13.232-24.292-3.12.066-8.929 24.39-12.845 24.385-4.25-.006-9.066-20.801-9.066-31.786M14.52 81.667C4.92 78.545 3.003 64.259.716 54.523c5.97-5.13 17.857-17.75 27.96-14.471 11.212 3.64 27.972 14.244 26.844 17.983-1.22 4.065-26.289 2.089-27.19 5.077-.905 2.988 20.437 16.03 19.221 19.753-1.319 4.039-22.584 2.195-33.032-1.198m43.393 50.699c-5.935 8.163-20.11 5.572-30.079 4.74-3.033-7.261-11.36-22.47-5.123-31.062 6.93-9.54 22.193-22.2 25.4-19.975 3.487 2.416-6.138 25.646-3.573 27.428C47.1 115.282 66.1 99.014 69.263 101.32c3.432 2.502-4.894 22.157-11.35 31.045m56.32-92.13c9.601-3.12 19.548 7.312 27.123 13.847-1.815 7.656-4.014 24.854-14.113 28.138-11.213 3.648-31.004 4.919-32.29 1.234-1.402-4.01 20.04-17.146 19.014-20.093-1.024-2.947-25.958-.953-27.16-4.68-1.31-4.047 16.981-15.05 27.425-18.446" />
				</svg>
				<div
					style={{
						fontWeight: 600,
						fontSize: 48,
						textAlign: "center",
						textWrap: "balance",
					}}
				>
					{title}
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{
					data: inter,
					name: "Inter",
					style: "normal",
					weight: 600,
				},
			],
		},
	);
}
