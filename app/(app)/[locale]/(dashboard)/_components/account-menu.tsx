"use client";

import type { ReactNode } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

export function AccountMenu(): ReactNode {
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
