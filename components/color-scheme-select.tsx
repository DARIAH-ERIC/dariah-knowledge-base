"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import type { Key, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPopover,
	SelectValue,
} from "@/components/ui/select";
import type { ColorScheme } from "@/lib/color-scheme-script";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ColorSchemeSelectProps {
	items: Record<ColorScheme | "system", string>;
	label: string;
}

/** `next/dynamic`/`React.lazy` require default exports. */
// TODO: this should be fixed in https://github.com/vercel/next.js/pull/61378
// eslint-disable-next-line import/no-default-export
export default function ColorSchemeSelect(props: ColorSchemeSelectProps): ReactNode {
	const { items, label } = props;

	const { colorSchemeState, setColorScheme } = useColorScheme();

	function onSelectionChange(key: Key) {
		const value = key as keyof ColorSchemeSelectProps["items"];

		setColorScheme(value === "system" ? null : value);
	}

	const selectedKey = colorSchemeState.kind === "system" ? "system" : colorSchemeState.colorScheme;

	const Icon = colorSchemeState.colorScheme === "dark" ? MoonIcon : SunIcon;

	return (
		<Select
			aria-label={label}
			name="color-scheme"
			onSelectionChange={onSelectionChange}
			selectedKey={selectedKey}
		>
			<Button size="icon" variant="ghost">
				<Icon aria-hidden={true} className="size-5 shrink-0" />
				<SelectValue className="sr-only" />
			</Button>
			<SelectPopover placement="bottom">
				<SelectContent>
					{Object.entries(items).map(([id, label]) => {
						return (
							<SelectItem key={id} id={id} textValue={label}>
								{label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</SelectPopover>
		</Select>
	);
}
