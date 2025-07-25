import { useFormatter } from "next-intl";
import type { ReactNode } from "react";

import type { CalculateOperationalCostParamsResult } from "@/lib/calculate-operational-cost";

interface SummaryProps {
	calculation: CalculateOperationalCostParamsResult;
}

export function Summary(props: SummaryProps): ReactNode {
	const { calculation } = props;

	const { list } = useFormatter();

	return (
		<dl className="prose prose-sm grid gap-y-4">
			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of partner institutions
				</dt>
				<dd>{calculation.count.institutions}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of contributors at national level
				</dt>
				<dd>{calculation.count.contributions}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of large meetings
				</dt>
				<dd>{calculation.count.events.large}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of medium meetings
				</dt>
				<dd>{calculation.count.events.medium}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of small meetings
				</dt>
				<dd>{calculation.count.events.small}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of DARIAH commissioned events
				</dt>
				<dd>{calculation.count.events.dariah}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					National website
				</dt>
				<dd>{list(calculation.url.website)}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					National social media
				</dt>
				<dd>{list(calculation.url.social)}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of small community services
				</dt>
				<dd>{calculation.count.services.small}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of medium community services
				</dt>
				<dd>{calculation.count.services.medium}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of large community services
				</dt>
				<dd>{calculation.count.services.large}</dd>
			</div>

			<div>
				<dt className="text-xs tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
					Number of core community services
				</dt>
				<dd>{calculation.count.services.core}</dd>
			</div>
		</dl>
	);
}
