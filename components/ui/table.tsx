import { ArrowUp } from "lucide-react";
import {
	Button,
	Cell as AriaCell,
	type CellProps,
	Collection,
	Column as AriaColumn,
	type ColumnProps,
	ColumnResizer,
	composeRenderProps,
	Group,
	ResizableTableContainer,
	Row as AriaRow,
	type RowProps,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
	Table as AriaTable,
	TableBody,
	TableHeader as AriaTableHeader,
	type TableHeaderProps,
	type TableProps,
	useTableOptions,
} from "react-aria-components";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, variants } from "@/lib/styles";

export { TableBody };

export function Table(props: TableProps) {
	return (
		<ResizableTableContainer className="relative scroll-pt-[2.281rem] overflow-auto rounded-lg border dark:border-neutral-600">
			<AriaTable {...props} className="border-separate border-spacing-0" />
		</ResizableTableContainer>
	);
}

const columnStyles = variants({
	base: "flex h-5 flex-1 items-center gap-1 overflow-hidden px-2",
});

const resizerStyles = variants({
	base: "rounded box-content h-5 w-px translate-x-[8px] cursor-col-resize bg-neutral-400 bg-clip-content px-[8px] py-1 -outline-offset-2 resizing:w-[2px] resizing:bg-accent-600 resizing:pl-[7px] dark:bg-neutral-500 forced-colors:bg-[ButtonBorder] forced-colors:resizing:bg-[Highlight]",
});

export function Column(props: ColumnProps) {
	return (
		<AriaColumn
			{...props}
			className={composeRenderProps(props.className, () => {
				return "[&:hover]:z-20 [&:focus-within]:z-20 text-start text-sm font-semibold text-neutral-700 dark:text-neutral-300 cursor-default";
			})}
		>
			{composeRenderProps(props.children, (children, { allowsSorting, sortDirection }) => {
				return (
					<div className="flex items-center">
						<Group className={columnStyles()} role="presentation" tabIndex={-1}>
							<span className="truncate">{children}</span>
							{allowsSorting ? (
								<span
									className={`flex size-4 items-center justify-center transition ${
										sortDirection === "descending" ? "rotate-180" : ""
									}`}
								>
									{sortDirection ? (
										<ArrowUp
											aria-hidden={true}
											className="size-4 text-neutral-500 dark:text-neutral-400 forced-colors:text-[ButtonText]"
										/>
									) : null}
								</span>
							) : null}
						</Group>
						{!props.width && <ColumnResizer className={resizerStyles()} />}
					</div>
				);
			})}
		</AriaColumn>
	);
}

export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
	const { allowsDragging } = useTableOptions();

	return (
		<AriaTableHeader
			{...props}
			className={cn(
				"sticky top-0 z-10 rounded-t-lg border-b bg-neutral-100/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-neutral-100 dark:border-b-neutral-700 dark:bg-neutral-700/60 dark:supports-[-moz-appearance:none]:bg-neutral-700 forced-colors:bg-[Canvas]",
				props.className,
			)}
		>
			{/* Add extra columns for drag and drop and selection. */}
			{allowsDragging ? <Column /> : null}
			<Collection items={props.columns}>{props.children}</Collection>
		</AriaTableHeader>
	);
}

const rowStyles = variants({
	base: "group/row relative cursor-default select-none text-sm text-neutral-900 -outline-offset-2 hover:bg-neutral-100 selected:bg-accent-100 selected:hover:bg-accent-200 disabled:text-neutral-300 dark:text-neutral-200 dark:hover:bg-neutral-700/60 dark:selected:bg-accent-700/30 dark:selected:hover:bg-accent-700/40 dark:disabled:text-neutral-600",
});

export function Row<T extends object>({ id, columns, children, ...otherProps }: RowProps<T>) {
	const { allowsDragging } = useTableOptions();

	return (
		<AriaRow id={id} {...otherProps} className={rowStyles()}>
			{allowsDragging ? (
				<Cell>
					<Button slot="drag">≡</Button>
				</Cell>
			) : null}
			<Collection items={columns}>{children}</Collection>
		</AriaRow>
	);
}

const cellStyles = variants({
	base: "truncate border-b p-2 -outline-offset-2 [--selected-border:theme(colors.accent.200)] group-last/row:border-b-0 group-selected/row:border-[--selected-border] dark:border-b-neutral-700 dark:[--selected-border:theme(colors.accent.900)] [:has(+[data-selected])_&]:border-[--selected-border]",
});

export function Cell(props: CellProps) {
	return <AriaCell {...props} className={cellStyles()} />;
}

interface SearchInputProps extends AriaSearchFieldProps {
	label: string;
	placeholder: string;
	filter: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TableFilter(props: SearchInputProps) {
	const { label, placeholder, filter, ...rest } = props;

	return (
		<AriaSearchField {...rest}>
			<Label className="sr-only">{label}</Label>
			<Input onChange={filter} placeholder={placeholder} />
		</AriaSearchField>
	);
}
