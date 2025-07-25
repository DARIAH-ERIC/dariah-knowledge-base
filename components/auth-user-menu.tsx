"use client";

import { UserIcon } from "lucide-react";
import { Header, type Key } from "react-aria-components";

import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/blocks/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { signOutAction } from "@/lib/actions/auth";
import { useRouter } from "@/lib/navigation/navigation";
import type { User } from "@/lib/server/auth/sessions";

interface AuthUserMenuProps {
	adminDashboardLabel: string;
	signOutLabel: string;
	toggleUserMenuLabel: string;
	user: User;
}

export function AuthUserMenu(props: AuthUserMenuProps) {
	const { adminDashboardLabel, signOutLabel, toggleUserMenuLabel, user } = props;

	const router = useRouter();

	const isAdminUser = user.role === "admin";

	async function onAction(key: Key) {
		switch (key) {
			case "admin-dashboard": {
				router.push("/dashboard/admin");
				break;
			}

			case "sign-out": {
				await signOutAction();
				break;
			}
		}
	}

	return (
		<DropdownMenuTrigger>
			<IconButton variant="plain">
				<UserIcon aria-hidden={true} className="size-5 shrink-0" />
				<span className="sr-only">{toggleUserMenuLabel}</span>
			</IconButton>
			{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
			<DropdownMenu onAction={onAction} placement="bottom">
				<Header className="mb-1.5 border-b border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
					Signed in as {user.name}
				</Header>
				{isAdminUser ? (
					<DropdownMenuItem id="admin-dashboard">{adminDashboardLabel}</DropdownMenuItem>
				) : null}
				<DropdownMenuItem id="sign-out">{signOutLabel}</DropdownMenuItem>
			</DropdownMenu>
		</DropdownMenuTrigger>
	);
}
