import { log } from "@acdh-oeaw/lib";
import type { ReactNode } from "react";

const fieldName = "phone-number";

export function createHoneypotFieldName(): string {
	return fieldName;
}

export function isValidFormSubmission(formData: FormData): boolean {
	if (formData.get(fieldName) === "") {
		return true;
	}

	log.warn("Honeypot form submission.");

	return false;
}

export function Honeypot(): ReactNode {
	const label = "Please do nof fill out this field";

	return (
		<div aria-hidden={true} className="sr-only">
			<label>
				<span>{label}</span>
				<input autoComplete="off" defaultValue="" name={fieldName} tabIndex={-1} />
			</label>
		</div>
	);
}
