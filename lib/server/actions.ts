export type ValidationErrors = Record<string, string | Array<string>>;

export interface InitialActionResult {
	status: "initial";
	formData: FormData | null;
}

export function createInitialActionResult({
	formData,
}: Partial<Pick<InitialActionResult, "formData">>): InitialActionResult {
	return {
		status: "initial",
		formData: formData ?? null,
	};
}

export interface SuccessActionResult {
	status: "success";
	timestamp: number;
	message: string | Array<string> | null;
	formData: FormData | null;
}

export function createSuccessActionResult({
	formData,
	message,
}: Partial<Pick<SuccessActionResult, "formData" | "message">>): SuccessActionResult {
	return {
		status: "success",
		timestamp: Date.now(),
		message: message ?? null,
		formData: formData ?? null,
	};
}

export interface ErrorActionResult {
	status: "error";
	timestamp: number;
	message: string | Array<string> | null;
	errors: Partial<Record<string, string | Array<string>>>;
	formData: FormData | null;
}

export function createErrorActionResult({
	errors,
	formData,
	message,
}: Partial<Pick<ErrorActionResult, "errors" | "formData" | "message">>): ErrorActionResult {
	return {
		status: "error",
		timestamp: Date.now(),
		message: message ?? null,
		errors: errors ?? {},
		/** @see https://github.com/facebook/react/issues/29034 */
		formData: formData ?? null,
	};
}

export type ActionResult = InitialActionResult | SuccessActionResult | ErrorActionResult;

export function getSuccessMessage(state: ActionResult): string | Array<string> | null | undefined {
	return state.status === "success" ? state.message : undefined;
}

export function getErrorMessage(state: ActionResult): string | Array<string> | null | undefined {
	return state.status === "error" ? state.message : undefined;
}

export function getFieldErrors(
	state: ActionResult,
): Record<string, string | Array<string>> | undefined {
	return state.status === "error"
		? /** `valibot` validation errors include `undefined`, but `react-aria-components` don't.  */
			(state.errors as Record<string, string | Array<string>>)
		: undefined;
}
