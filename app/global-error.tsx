"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

import { defaultLocale } from "@/lib/i18n/locales";

interface GlobalErrorProps {
	error: Error & { digest?: string };
}

export default function GlobalError(props: GlobalErrorProps) {
	const { error } = props;

	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang={defaultLocale}>
			<body>
				<Error statusCode={500} />
			</body>
		</html>
	);
}
