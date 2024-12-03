"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { ArrowUpIcon, CheckCircle2Icon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Cell,
	Column,
	type ColumnProps,
	ColumnResizer,
	Group,
	ResizableTableContainer,
	Row,
	Table,
	TableBody,
	TableHeader,
} from "react-aria-components";

const sortedReports = [
	{ id: "1", year: 2024, country: "Austria", status: "active" },
	{ id: "2", year: 2023, country: "Austria", status: "frozen" },
];

const label = "Reports";

export function ReportsTable(): ReactNode {
	return (
		<ResizableTableContainer className="relative w-full overflow-auto">
			<Table
				aria-label={label}
				// onSortChange={setSortDescriptor}
				// sortDescriptor={sortDescriptor}
			>
				<TableHeader>
					<TableColumn
						allowsSorting={true}
						className="sticky top-0 cursor-default border-y border-stroke-weak px-4 py-3 text-left text-tiny font-strong text-text-weak outline-none"
						id="year"
						isRowHeader={true}
					>
						Year
					</TableColumn>
					<TableColumn
						allowsSorting={true}
						className="sticky top-0 cursor-default border-y border-stroke-weak px-4 py-3 text-left text-tiny font-strong text-text-weak outline-none"
						defaultWidth="3fr"
						id="country"
					>
						Country
					</TableColumn>
					<TableColumn
						allowsSorting={true}
						className="sticky top-0 cursor-default border-y border-stroke-weak px-4 py-3 text-left text-tiny font-strong text-text-weak outline-none"
						id="status"
					>
						Status
					</TableColumn>
				</TableHeader>

				<TableBody items={sortedReports}>
					{(item) => {
						return (
							<Row className="group cursor-default outline-none">
								<Cell className="truncate border-b border-stroke-weak p-4 text-small text-text-weak">
									{item.year}
								</Cell>
								<Cell className="truncate border-b border-stroke-weak p-4 text-small text-text-weak">
									{item.country}
								</Cell>
								<Cell className="truncate border-b border-stroke-weak p-4 text-small text-text-weak">
									<span className="inline-flex min-h-6 items-center gap-x-1 rounded-4 border border-stroke-success-weak bg-fill-success-weak px-2 py-0.5 text-tiny text-text-success">
										<CheckCircle2Icon className="size-4 shrink-0 text-icon-success" />
										{item.status}
									</span>
								</Cell>
							</Row>
						);
					}}
				</TableBody>
			</Table>
		</ResizableTableContainer>
	);
}

interface TableColumnProps extends ColumnProps {
	children: ReactNode;
}

function TableColumn(props: TableColumnProps): ReactNode {
	const { children } = props;

	return (
		<Column
			{...props}
			className="sticky top-0 cursor-default border-y border-stroke-weak text-left text-tiny font-strong text-text-weak outline-none"
		>
			{({ allowsSorting, sortDirection }) => {
				return (
					<div className="flex items-center">
						<Group
							className="flex flex-1 items-center overflow-hidden px-4 py-3.5 outline-none"
							role="presentation"
							tabIndex={-1}
						>
							<span className="flex-1 truncate">{children}</span>
							{allowsSorting ? (
								<ArrowUpIcon
									aria-hidden={true}
									className={cn(
										"size-5 shrink-0 text-icon-neutral",
										sortDirection === "descending" ? "rotate-180" : undefined,
									)}
								/>
							) : null}
						</Group>
						<ColumnResizer className="h-6 cursor-col-resize border-r border-stroke-weak transition resizing:border-stroke-strong" />
					</div>
				);
			}}
		</Column>
	);
}
