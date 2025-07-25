import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
	Dialog as DialogContent,
	DialogCloseButton,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Modal, ModalOverlay, type ModalOverlayProps } from "@/components/ui/modal";

interface DialogProps
	extends Omit<ModalOverlayProps, "isDismissable" | "isKeyboardDismissDisabled"> {
	children?: ReactNode;
	description?: ReactNode;
	title: ReactNode;
}

export function Drawer(props: DialogProps): ReactNode {
	const { children, description, title, ...rest } = props;

	const t = useTranslations("ui.Dialog");

	return (
		<ModalOverlay>
			<Modal
				{...rest}
				className="relative grid content-stretch justify-start p-0! entering:duration-200 entering:ease-out entering:animate-in entering:slide-in-from-left exiting:duration-150 exiting:ease-in exiting:animate-out exiting:slide-out-to-left"
				isDismissable={true}
			>
				<DialogContent className="rounded-none">
					<DialogCloseButton aria-label={t("close")} />
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					{children}
				</DialogContent>
			</Modal>
		</ModalOverlay>
	);
}

export { DialogTrigger as DrawerTrigger };
