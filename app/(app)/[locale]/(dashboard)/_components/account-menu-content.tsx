"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { ChevronDownIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover, Separator } from "react-aria-components";

import type { User } from "@/lib/server/auth/users";

interface AccountMenuContentProps {
	settingsLabel: string;
	signOutLabel: string;
	user: User;
}

export function AccountMenuContent(props: AccountMenuContentProps): ReactNode {
	const { settingsLabel, signOutLabel, user } = props;

	return (
		<MenuTrigger>
			<Button
				className={cn(
					"inline-flex min-h-12 items-center gap-x-2 rounded-2 px-4 py-2 text-tiny text-text-strong",
					"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
				)}
			>
				<div className="size-8 rounded-full border border-stroke-weak object-cover" />
				{/* <img
					alt=""
					className="size-8 rounded-full border border-stroke-weak object-cover"
					src={null}
				/> */}
				{user.username}
				<ChevronDownIcon className="size-5 shrink-0 text-icon-neutral" />
			</Button>
			<Popover
				className={cn(
					"min-w-[var(--trigger-width)] rounded-2 border border-stroke-weak bg-background-overlay shadow-overlay",
					"placement-bottom:translate-y-1 placement-bottom:slide-in-from-top-2 entering:animate-in entering:fade-in-0 exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95",
				)}
				placement="bottom"
			>
				<div className="max-h-[inherit] min-w-40 overflow-auto py-2">
					<div className="inline-flex items-center gap-x-3 px-4 py-3">
						<div className="size-12 rounded-full border border-stroke-weak object-cover" />
						{/* <img
						alt=""
						className="size-12 rounded-full border border-stroke-weak object-cover"
						src={null}
					/> */}
						<div>
							<div className="text-small text-text-strong">{user.username}</div>
							<div className="text-tiny text-text-weak">{user.email}</div>
						</div>
					</div>
					<Menu>
						<Separator className="my-1 w-full border-t border-stroke-weak" />
						<MenuItem
							className={cn(
								"flex cursor-pointer select-none items-center gap-x-3 px-4 py-3 text-small text-text-strong",
								"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
							)}
							textValue={settingsLabel}
						>
							<SettingsIcon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" />
							{settingsLabel}
						</MenuItem>
						<Separator className="my-1 w-full border-t border-stroke-weak" />
						<MenuItem
							className={cn(
								"flex cursor-pointer select-none items-center gap-x-3 px-4 py-3 text-small text-text-strong",
								"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
							)}
							textValue={signOutLabel}
						>
							<LogOutIcon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" />
							{signOutLabel}
						</MenuItem>
					</Menu>
				</div>
			</Popover>
		</MenuTrigger>
	);
}
