"use client";

import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { createHref } from "@/lib/navigation/create-href";

interface SkipLinkProps {
	children: ReactNode;
	id?: string;
	targetId: string;
}

export function SkipLink(props: SkipLinkProps): ReactNode {
	const { children, id, targetId } = props;

	/**
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=308064
	 */
	function onClick() {
		document.getElementById(targetId)?.focus();
	}

	return (
		<Link
			className="rounded fixed z-50 -translate-y-full bg-background px-4 py-3 text-neutral-700 transition focus:translate-y-0 dark:text-neutral-200"
			href={createHref({ hash: targetId })}
			id={id}
			onClick={onClick}
		>
			{children}
		</Link>
	);
}
