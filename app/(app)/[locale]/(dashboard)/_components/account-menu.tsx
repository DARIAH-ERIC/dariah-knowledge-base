"use client";

import type { ReactNode } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

import type { User } from "@/lib/server/auth/users";

interface AccountMenuProps {
	user: User;
}

export function AccountMenu(props: AccountMenuProps): ReactNode {
	const { user } = props;

	return (
		<MenuTrigger>
			<Button>Stefan Probst</Button>
			<Popover>
				<Menu>
					<MenuItem>Sign out</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	);
}
